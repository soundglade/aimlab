# Meditation JSON Format & Feature Documentation

This document describes the **JSON-based format** used to represent a guided meditation script in a structured way. The goal is to enable consistent storage, editing, and playback (e.g., via text-to-speech). We'll also highlight which features are supported and how they map to the JSON properties.

---

## Overview

A meditation script is represented as an **array** of **step objects**. Each object in the array has a `type` field (e.g., `"speech"`, `"heading"`, `"pause"`, etc.) which indicates how that step should be interpreted by the meditation player or text-to-speech engine.

**Example** (high-level):

```json
[
  {
    "type": "heading",
    "text": "Guided Meditation for Grounding",
    "readAloud": false
  },
  {
    "type": "speech",
    "text": "Find a comfortable position, gently close your eyes..."
  },
  {
    "type": "pause",
    "duration": 10,
    "canExtend": true,
    "waitForUserInput": false
  },
  {
    "type": "aside",
    "text": "Teacher's note: You might want to play a bell here."
  },
  {
    "type": "sound",
    "soundId": "bell_soft_01",
    "description": "Soft bell"
  },
  {
    "type": "speech",
    "text": "Now, bring awareness to your breath..."
  },
  {
    "type": "pause",
    "duration": 60,
    "canExtend": false,
    "waitForUserInput": true
  },
  {
    "type": "direction",
    "text": "Speak gently, slow pace"
  },
  {
    "type": "speech",
    "text": "When you're ready, gently open your eyes."
  }
]
```

## Step Types

### 1. heading

Represents a visual section heading or title within the meditation. Supports three levels of headings that correspond to markdown h1, h2, and h3 tags.

**Fields:**

- `type`: "heading"
- `text`: (string) The heading text
- `level`: (number) The heading level (1, 2, or 3)
  - `1`: Top-level heading (h1)
  - `2`: Sub-heading (h2)
  - `3`: Sub-sub-heading (h3)
- `readAloud`: (boolean) Indicates whether this heading should be spoken by TTS engines.
  - `true`: The heading text will be read aloud.
  - `false`: The heading is shown visually but not read out loud.

**Example:**

```json
{
  "type": "heading",
  "text": "Body Scan Meditation",
  "level": 1,
  "readAloud": false
},
{
  "type": "heading",
  "text": "Lower Body Section",
  "level": 2,
  "readAloud": false
},
{
  "type": "heading",
  "text": "Feet and Ankles",
  "level": 3,
  "readAloud": false
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
- `duration`: (number) Default length of the pause in seconds. (e.g. 10 for a 10-second pause)
- `canExtend`: (boolean) Indicates if the pause duration is flexible (e.g. can be lengthened by the user or the system).
  - `true`: The pause could be stretched out for a longer duration (e.g., to convert a 10-minute meditation to 20 minutes).
  - `false`: The pause is fixed.
- `waitForUserInput`: (boolean)
  - `true`: The player should wait for an explicit user action (e.g., pressing "Continue") to move on.
  - `false`: The pause automatically ends after duration seconds.

**Example:**

```json
{
  "type": "pause",
  "duration": 30,
  "canExtend": false,
  "waitForUserInput": true
}
```

In this example, the meditation will remain silent for 30 seconds minimum and then wait until the user chooses to continue.

### 4. sound

Represents a moment in the script where a specific sound (e.g., a bell or chime) should be played.

**Fields:**

- `type`: "sound"
- `soundId`: (string) An identifier or filename for the sound to be played.
- `description`: (string, optional) A short description of the sound (e.g., "Soft bell," "Tibetan bowl").

**Example:**

```json
{
  "type": "sound",
  "soundId": "bell_soft_01",
  "description": "Soft bell"
}
```

### 5. aside

Represents textual content not intended to be read aloud. This can include teacher's notes, extra context, or optional instructions that appear visually for the user but remain silent in playback.

**Fields:**

- `type`: "aside"
- `text`: (string) The note or instruction to be displayed but not spoken.

**Example:**

```json
{
  "type": "aside",
  "text": "Teacher's note: If participants seem restless, consider a longer pause here."
}
```

### 6. direction

Represents performance instructions that may or may not be processed by advanced TTS engines. By default, these are not read out loud verbatim. Instead, they're placeholders for interpretative instructions or special "metadata" for the person leading the meditation or the TTS system if it's capable of advanced prosody.

**Fields:**

- `type`: "direction"
- `text`: (string) Brief text describing the instruction (e.g., "Speak softly," "Lower volume," "Play music at low volume," etc.)

**Example:**

```json
{
  "type": "direction",
  "text": "Use a calm, soothing tone for the next speech block."
}
```

## Features & Behavior

Below are the core features supported in this format, along with how the meditation player or editor might respond.

### 1. Headings with Optional Speech

- `heading.readAloud` can be used to quickly toggle whether headings are spoken.
- Visually, headings can help chunk a meditation into sections.

### 2. Speech Blocks

- Rendered as text to be read out loud by a TTS engine.
- Typically, this is the main content that drives the guided experience.

### 3. Pauses with Flexible or Fixed Duration

- `duration` determines how many seconds of silence.
- `canExtend = true` allows the user to lengthen this pause (in settings or dynamically).
- `waitForUserInput = true` means the script won't proceed until the user manually advances it (e.g., pressing "Next").

### 4. Sound Effects

- A "sound" item references a file or effect to be played.
- This can be integrated into the timeline (e.g., ring a bell before shifting to the next section).

### 5. Asides (Visual-Only Notes)

- Displayed in the meditation interface but not spoken.
- Useful for teacher's commentary or detailed instructions that the participant can reference if desired.

### 6. Directions for Performance

- Not read out loud by default.
- Potentially used by advanced TTS engines or manual interpreters to adjust speaking style ("Speak slowly," "Pause 2 seconds after next line," etc.).

## Example: Full JSON

Below is a more complete JSON example that demonstrates all step types in one coherent meditation script:

```json
[
  {
    "type": "heading",
    "text": "Calming Evening Meditation",
    "level": 1,
    "readAloud": false
  },
  {
    "type": "heading",
    "text": "Introduction",
    "level": 2,
    "readAloud": false
  },
  {
    "type": "speech",
    "text": "Welcome to this short evening meditation. Find a comfortable position, either seated or lying down."
  },
  {
    "type": "pause",
    "duration": 5,
    "canExtend": false,
    "waitForUserInput": false
  },
  {
    "type": "heading",
    "text": "Breath Awareness",
    "level": 2,
    "readAloud": false
  },
  {
    "type": "speech",
    "text": "Gently close your eyes if that feels comfortable, and begin to notice your breath—moving in and out, without needing to change it."
  },
  {
    "type": "aside",
    "text": "Optional note: For advanced practitioners, suggest focusing on belly breathing here."
  },
  {
    "type": "heading",
    "text": "Deep Breathing Exercise",
    "level": 3,
    "readAloud": false
  },
  {
    "type": "pause",
    "duration": 20,
    "canExtend": true,
    "waitForUserInput": false
  },
  {
    "type": "sound",
    "soundId": "chime_01",
    "description": "Gentle wind chime"
  },
  {
    "type": "heading",
    "text": "Body Relaxation",
    "level": 2,
    "readAloud": false
  },
  {
    "type": "speech",
    "text": "Now, allow any tension in your shoulders or jaw to melt away. Imagine a soft light traveling from your head to your toes."
  },
  {
    "type": "direction",
    "text": "Lower voice volume slightly for the next speech section."
  },
  {
    "type": "speech",
    "text": "Take a slow, deep breath in... hold for a moment... and exhale fully, letting go of the day."
  },
  {
    "type": "pause",
    "duration": 60,
    "canExtend": false,
    "waitForUserInput": true
  },
  {
    "type": "heading",
    "text": "Closing",
    "level": 2,
    "readAloud": false
  },
  {
    "type": "speech",
    "text": "When you're ready, gently open your eyes, feeling calm and at ease."
  }
]
```
