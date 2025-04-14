# 🧘 Kokoro TTS API Integration Guide

This document explains how to connect your **Next.js** app to the self-hosted **Kokoro FastAPI** TTS server running at `https://kokoro.soundglade.com`.

Kokoro provides OpenAI-compatible endpoints for text-to-speech synthesis. It supports both direct audio file generation and real-time audio streaming.

---

## 🔗 Base URL

https://kokoro.soundglade.com/v1

---

## 📦 Available Endpoints

### 1. **POST** `/v1/audio/speech`

Generates speech audio from input text.

**Request JSON:**

```json
{
  "model": "kokoro",
  "input": "Your meditation text goes here...",
  "voice": "af_bella",
  "response_format": "mp3" // or "wav", "flac", "opus", "pcm"
}
```

**Returns:** Binary audio file (e.g. MP3)

---

### 2. **GET** `/v1/audio/voices`

Returns a list of supported voice models.

---

## 🚀 Basic Integration (Fetch in Next.js)

```ts
// utils/kokoroTTS.ts
export async function synthesizeTTS(text: string): Promise<Blob> {
  const response = await fetch(
    "https://kokoro.soundglade.com/v1/audio/speech",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kokoro",
        input: text,
        voice: "af_bella", // Change as needed
        response_format: "mp3",
      }),
    }
  );

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: "audio/mp3" });
}
```

**Usage:**

```ts
const blob = await synthesizeTTS("Take a deep breath...");
const audioUrl = URL.createObjectURL(blob);
const audio = new Audio(audioUrl);
audio.play();
```

---

## 🔁 Streaming Support (PCM format)

Kokoro also supports streaming audio via HTTP.

```ts
// utils/kokoroStreaming.ts
export async function streamTTS(
  text: string,
  onChunk: (chunk: Uint8Array) => void
) {
  const res = await fetch("https://kokoro.soundglade.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "kokoro",
      input: text,
      voice: "af_bella",
      response_format: "pcm",
    }),
  });

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) onChunk(value);
  }
}
```

To play this live via Web Audio API or WebAssembly (e.g. for PCM playback), you'll need a PCM decoder or audio pipeline — integration with `AudioWorklet` or `AudioBufferSourceNode`.

> ⚠️ Streaming is low-latency, but **requires extra decoding logic** if you want real-time playback. Most use cases should start with basic MP3 download/playback.

---

## 🔧 Tips

- To avoid memory or stability issues, send **short paragraphs** (≤ 2–3 sentences per request).
- For longer scripts, chunk text in code and **sequentially synthesize** each part.
- You can combine audio files client-side using Web APIs or server-side if needed.
- The system is unauthenticated — no API key is required.

---

## 🧪 Debugging / Monitoring

- Web UI: `https://kokoro.soundglade.com/web`
- Swagger API Docs: `https://kokoro.soundglade.com/docs`

---

## ✅ Available Voices

To fetch available voices:

```bash
curl https://kokoro.soundglade.com/v1/audio/voices
```

Example voices include:

- `af_bella`
- `af_sky`
- `af_bella+af_sky`
- `af_bella(2)+af_heart(1)` (weighted mixes)
