const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const MeetingSummary = require('../models/MeetingSummary');
const axios = require('axios');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config (local disk)
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname || '');
		cb(null, `meeting-${unique}${ext}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 1024 * 1024 * 200 } // 200MB
});

// Helper: Transcribe using OpenAI Whisper API
async function transcribeFileWithOpenAI(filePath) {
	const OpenAI = require('openai');
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	const fileStream = fs.createReadStream(filePath);
	const transcript = await openai.audio.transcriptions.create({
		file: fileStream,
		model: 'whisper-1',
		response_format: 'text'
	});
	return transcript;
}

// Helper: Summarize transcript using Groq or OpenAI
async function summarizeTranscriptStructured(transcriptText) {
	const prompt = `You are an AI meeting assistant. Summarize this transcript into:

Key Discussion Points (bullet list)
Decisions Made (bullet list)
Action Items (with responsible person if mentioned)
Risks / Follow-ups

Return strict JSON with keys: keyPoints, decisions, actionItems, risks. Example:
{"keyPoints": ["..."], "decisions": ["..."], "actionItems": ["..."], "risks": ["..."]}

Transcript:\n${transcriptText}`;

	// Prefer Groq if key available, else fall back to OpenAI
	try {
		if (process.env.GROQ_API_KEY) {
			const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
				model: 'llama3-70b-8192',
				messages: [
					{ role: 'system', content: 'You produce concise, structured JSON responses only.' },
					{ role: 'user', content: prompt }
				]
			}, {
				headers: {
					Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
					'Content-Type': 'application/json'
				}
			});
			const content = resp.data.choices[0].message.content || '{}';
			return JSON.parse(content);
		}
	} catch (e) {
		console.error('Groq summarize failed, falling back to OpenAI:', e.message);
	}

	if (process.env.OPENAI_API_KEY) {
		const OpenAI = require('openai');
		const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
		const resp = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You produce concise, structured JSON responses only.' },
				{ role: 'user', content: prompt }
			]
		});
		const content = resp.choices?.[0]?.message?.content || '{}';
		return JSON.parse(content);
	}

	return { keyPoints: [], decisions: [], actionItems: [], risks: [] };
}

// POST /api/meetings/upload
router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		const { title, orgId, userId } = req.body;
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		if (!title) {
			return res.status(400).json({ error: 'Title is required' });
		}

		// 1) Transcribe
		let transcriptText = '';
		try {
			transcriptText = await transcribeFileWithOpenAI(req.file.path);
		} catch (e) {
			console.error('Transcription failed:', e.message);
			return res.status(500).json({ error: 'Transcription failed' });
		}

		// 2) Summarize
		let structured;
		try {
			structured = await summarizeTranscriptStructured(transcriptText);
		} catch (e) {
			console.error('Summarization failed:', e.message);
			structured = { keyPoints: [], decisions: [], actionItems: [], risks: [] };
		}

		// 3) Save
		const doc = await MeetingSummary.create({
			title,
			orgId: orgId || null,
			userId: userId || null,
			transcript: transcriptText,
			summary: structured
		});

		return res.json({ success: true, meeting: doc });
	} catch (err) {
		console.error('Upload error:', err);
		res.status(500).json({ error: 'Failed to process meeting upload' });
	}
});

// GET /api/meetings
router.get('/', async (req, res) => {
	try {
		const { orgId } = req.query;
		const query = {};
		if (orgId) query.orgId = orgId;
		const items = await MeetingSummary.find(query).sort({ createdAt: -1 }).limit(200);
		res.json({ success: true, meetings: items });
	} catch (e) {
		console.error('List meetings failed:', e.message);
		res.status(500).json({ error: 'Failed to list meetings' });
	}
});

// GET /api/meetings/:id
router.get('/:id', async (req, res) => {
	try {
		const item = await MeetingSummary.findById(req.params.id);
		if (!item) return res.status(404).json({ error: 'Not found' });
		res.json({ success: true, meeting: item });
	} catch (e) {
		res.status(500).json({ error: 'Failed to get meeting' });
	}
});

module.exports = router;
