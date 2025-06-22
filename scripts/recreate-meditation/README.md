# Recreate Meditation Script

This script recreates the full audio file for a meditation by re-concatenating its individual audio steps.

## Usage

```bash
npx tsx scripts/recreate-meditation/index.ts <readingId>
```

## Example

```bash
npx tsx scripts/recreate-meditation/index.ts ncsiyb8
```

## What it does

1. Takes a reading ID as input
2. Reads the `script.json` file from `/public/storage/readings/{readingId}/script.json`
3. Extracts and orders the audio files using the same logic as the original synthesis
4. Concatenates all audio files into a single MP3
5. Replaces the existing full audio file

## Requirements

- The reading directory must exist in `/public/storage/readings/{readingId}/`
- The `script.json` file must exist and be valid JSON
- All individual audio files referenced in the script must exist
- FFmpeg must be installed and configured (used by the audio concatenation library)

## Notes

- This script only regenerates the full audio file
- It does not modify the `script.json` or any other files
- Uses the same concatenation logic as the original meditation synthesis process
- Minimal type safety by design (one-off utility script)
