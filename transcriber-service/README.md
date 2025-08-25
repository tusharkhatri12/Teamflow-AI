# Transcriber Service (FastAPI + Faster-Whisper)

A CPU-friendly speech-to-text microservice to transcribe audio/video files using Faster-Whisper, designed for Render free tier (no GPU).

- Framework: FastAPI
- Transcription: Faster-Whisper (model size configurable)
- Video support: Extracts audio with ffmpeg
- Endpoint: `POST /transcribe` (multipart file upload)
- CORS enabled (configure allowed origins via env)

## Local Setup

### 1) Install Python dependencies
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

### 2) Install ffmpeg
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get update && sudo apt-get install -y ffmpeg`
- Windows (choco): `choco install ffmpeg` or download static build and add to PATH

### 3) Run the service
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
Open http://localhost:8000/health

## API

### POST /transcribe
Multipart request with field `file` (MP3, WAV, M4A, MP4, MOV, etc.).

Response example:
```json
{
  "success": true,
  "language": "en",
  "duration": 123.45,
  "text": "Transcribed content here..."
}
```

## Configuration

Environment variables:
- `FASTER_WHISPER_MODEL` (default: `small`) – options: `base`, `small`, `medium` (bigger = slower)
- `FASTER_WHISPER_COMPUTE` (default: `int8`) – for CPU use `int8` or `int8_float32`
- `FASTER_WHISPER_BEAM_SIZE` (default: `5`)
- `FASTER_WHISPER_BEST_OF` (default: `5`)
- `CORS_ORIGINS` – comma-separated origins, e.g. `http://localhost:3000,https://your-backend.onrender.com`

## Deploy to Render

1. Create a new Render Web Service
   - Environment: `Python 3`
   - Build Command:
     ```
     pip install -r requirements.txt
     ```
   - Start Command:
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

2. Add Environment Variables
   - `FASTER_WHISPER_MODEL=small`
   - `FASTER_WHISPER_COMPUTE=int8`
   - `CORS_ORIGINS=https://teamflow-ai.onrender.com,https://your-node-backend.onrender.com,http://localhost:3000`

3. ffmpeg on Render
   - Render’s Python environment may not include ffmpeg. Add a Render Build Command step to download a static ffmpeg binary, or vendor it. Example:
     ```bash
     apt-get update && apt-get install -y ffmpeg || true
     ```
     If `apt-get` isn’t permitted, download a static build in the build step and add it to PATH.

4. Deploy

## Calling from Node.js

```js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function transcribeViaService(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  const resp = await axios.post('https://your-transcriber.onrender.com/transcribe', form, {
    headers: form.getHeaders()
  });
  return resp.data.text;
}
```

## Notes
- The first request initializes the model and may be slower (cold start).
- For lower memory/CPU, use `FASTER_WHISPER_MODEL=base`.
- This service is stateless; no files are persisted beyond request handling.
