# Moodboard manifest

`bin/build-moodboard.js` reads this JSON. Only `title` and each item's `image`
or `video` are required.

```json
{
  "title": "Animated logos",
  "brief": "Logo motion that reads as art, not product polish.",
  "assumptions": "No project brief; broad survey. Clips are silent, first 10 s.",
  "date": "2026-11-08",
  "palette": ["#1F1B16", "#F4EDE4", "#E2552B"],
  "groups": [
    {
      "name": "Under force",
      "note": "Type pushed, sliced and tunnelled until it nearly breaks.",
      "items": [
        {
          "video": "media/02.mp4",
          "image": "media/02.jpg",
          "title": "Letter g — displacement",
          "author": "Daria Yur",
          "source": "Pinterest",
          "url": "https://www.pinterest.com/pin/850406342177389631/",
          "original": "https://behance.net/dariayur",
          "why": "A single glyph ripples as if under water yet keeps its shape.",
          "tags": ["displacement", "single glyph"]
        }
      ]
    }
  ]
}
```

- `image`: `https://` URL or path relative to the manifest. With `video`, it's the poster.
- `video`: mp4/webm URL or path. Plays muted, looping, inline.
- `url`: where you found it. `original`: the creator's own post or site, when known.
- `palette`, `assumptions`, `author`, `tags`: optional, shown when present.

## Shrinking media

Keep the board small enough to email (aim under ~15 MB):

```bash
ffmpeg -y -t 10 -i in.mp4 -an -vf "scale='min(480,iw)':-2" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart media/NN.mp4
ffmpeg -y -ss 2 -i in.mp4 -frames:v 1 -vf "scale='min(480,iw)':-2" -q:v 5 media/NN.jpg
```

Sound is stripped; say so in `assumptions`. The builder downscales remote images
itself when `ffmpeg` or `sips` is available, and embeds them as-is otherwise.
