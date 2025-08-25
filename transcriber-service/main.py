import os
import shutil
import subprocess
import tempfile
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel

# -----------------------------
# Config
# -----------------------------
MODEL_SIZE = os.getenv("FASTER_WHISPER_MODEL", "small")  # "base", "small"
COMPUTE_TYPE = os.getenv("FASTER_WHISPER_COMPUTE", "int8")  # good for CPU: int8, int8_float32
BEAM_SIZE = int(os.getenv("FASTER_WHISPER_BEAM_SIZE", "5"))
BEST_OF = int(os.getenv("FASTER_WHISPER_BEST_OF", "5"))

# Lazy model init (loads on first request)
_model: Optional[WhisperModel] = None

def get_model() -> WhisperModel:
	global _model
	if _model is None:
		_model = WhisperModel(
			MODEL_SIZE,
			device="cpu",
			compute_type=COMPUTE_TYPE
		)
	return _model

# -----------------------------
# App
# -----------------------------
app = FastAPI(title="Transcriber Service", version="1.0.0")

# CORS (allow your backend domain; for dev allow localhost)
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,https://teamflow-ai.onrender.com").split(",")
app.add_middleware(
	CORSMiddleware,
	allow_origins=[o.strip() for o in allowed_origins if o.strip()],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# -----------------------------
# Utils
# -----------------------------

def ensure_ffmpeg_available() -> bool:
	return shutil.which("ffmpeg") is not None


def extract_audio_with_ffmpeg(input_path: str, output_path: str) -> None:
	if not ensure_ffmpeg_available():
		raise RuntimeError("ffmpeg not found on PATH. See README to install static ffmpeg on Render.")
	cmd = [
		"ffmpeg", "-y", "-i", input_path,
		"-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
		output_path
	]
	proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	if proc.returncode != 0:
		raise RuntimeError(f"ffmpeg failed: {proc.stderr.decode(errors='ignore')}")


def is_video_filename(name: str) -> bool:
	name = (name or "").lower()
	return name.endswith((".mp4", ".mov", ".mkv", ".avi", ".m4v"))


def is_audio_filename(name: str) -> bool:
	name = (name or "").lower()
	return name.endswith((".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"))

# -----------------------------
# Routes
# -----------------------------

@app.get("/health")
def health():
	return {"ok": True, "model": MODEL_SIZE, "compute": COMPUTE_TYPE}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
	if file is None or file.filename is None:
		raise HTTPException(status_code=400, detail="No file uploaded")

	# Save upload to temp
	tmp_dir = tempfile.mkdtemp(prefix="transcriber_")
	input_path = os.path.join(tmp_dir, file.filename)
	try:
		with open(input_path, "wb") as f:
			content = await file.read()
			f.write(content)

		# If video, extract audio to wav 16k mono
		audio_path = input_path
		if is_video_filename(file.filename) and not is_audio_filename(file.filename):
			audio_path = os.path.join(tmp_dir, "audio.wav")
			extract_audio_with_ffmpeg(input_path, audio_path)

		# Transcribe using Faster-Whisper
		model = get_model()
		segments, info = model.transcribe(
			audio_path,
			beam_size=BEAM_SIZE,
			best_of=BEST_OF,
			vad_filter=True,
		)

		# Concatenate text
		text_parts = []
		for seg in segments:
			text_parts.append(seg.text)
		full_text = " ".join(t.strip() for t in text_parts).strip()

		return JSONResponse({
			"success": True,
			"language": info.language,
			"duration": info.duration,
			"text": full_text
		})
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
	finally:
		try:
			shutil.rmtree(tmp_dir, ignore_errors=True)
		except Exception:
			pass


# For local: uvicorn main:app --host 0.0.0.0 --port 8000
