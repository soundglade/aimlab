# Meditation JSON Format & Feature Documentation

This document describes the **JSON-based format** used to represent a guided meditation script in a structured way. The goal is to enable consistent storage, editing, and playback (e.g., via text-to-speech).

---

## Overview

A meditation script is represented as an **array** of **step objects**. Each object in the array has a `type` field (e.g., `"speech"`, `"heading"`, `"pause"`) which indicates how that step should be interpreted by the meditation player or text-to-speech engine.

**Example** (high-level):

```json
[
  {
    "type": "heading",
    "text": "Guided Meditation for Grounding"
  },
  {
    "type": "speech",
    "text": "Find a comfortable position, gently close your eyes..."
  },
  {
    "type": "pause",
    "duration": 10
  },
  {
    "type": "speech",
    "text": "Now, bring awareness to your breath..."
  },
  {
    "type": "pause",
    "duration": 60
  },
  {
    "type": "speech",
    "text": "When you're ready, gently open your eyes."
  }
]
```

## Step Types

### 1. heading

Represents a visual section heading or title within the meditation.

**Fields:**

- `type`: "heading"
- `text`: (string) The heading text

**Example:**

```json
{
  "type": "heading",
  "text": "Body Scan Meditation"
}
```

### 2. speech

Represents a block of text that should be read out loud by the text-to-speech engine.

**Fields:**

- `type`: "speech"
- `text`: (string) The script lines that should be spoken.

**Example:**

```json
{
  "type": "speech",
  "text": "Take a deep breath in through your nose and slowly exhale through your mouth."
}
```

### 3. pause

Represents a period of silence or waiting.

**Fields:**

- `type`: "pause"
- `duration`: (number) Length of the pause in seconds. (e.g. 10 for a 10-second pause)

**Example:**

```json
{
  "type": "pause",
  "duration": 30
}
```

## Features & Behavior

Below are the core features supported in this format, along with how the meditation player or editor might respond.

### 1. Headings

- Visually, headings can help chunk a meditation into sections.

### 2. Speech Blocks

- Rendered as text to be read out loud by a TTS engine.
- Typically, this is the main content that drives the guided experience.

### 3. Pauses

- `duration` determines how many seconds of silence.

## Example: Full JSON

Below is a complete JSON example that demonstrates all step types in one coherent meditation script:

```json
[
  {
    "type": "heading",
    "text": "Calming Evening Meditation"
  },
  {
    "type": "speech",
    "text": "Welcome to this short evening meditation. Find a comfortable position, either seated or lying down."
  },
  {
    "type": "pause",
    "duration": 5
  },
  {
    "type": "heading",
    "text": "Breath Awareness"
  },
  {
    "type": "speech",
    "text": "Gently close your eyes if that feels comfortable, and begin to notice your breath—moving in and out, without needing to change it."
  },
  {
    "type": "pause",
    "duration": 20
  },
  {
    "type": "heading",
    "text": "Body Relaxation"
  },
  {
    "type": "speech",
    "text": "Now, allow any tension in your shoulders or jaw to melt away. Imagine a soft light traveling from your head to your toes."
  },
  {
    "type": "speech",
    "text": "Take a slow, deep breath in... hold for a moment... and exhale fully, letting go of the day."
  },
  {
    "type": "pause",
    "duration": 60
  },
  {
    "type": "heading",
    "text": "Closing"
  },
  {
    "type": "speech",
    "text": "When you're ready, gently open your eyes, feeling calm and at ease."
  }
]
```
