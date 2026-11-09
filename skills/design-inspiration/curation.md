# Curation

## Angles

Search for qualities, not industries. "Fintech" alone returns the same blue
gradient dashboards everywhere. Split the brief into 3–6 angles, each aimed at
one attribute:

| Brief | Weak query | Better angles |
|---|---|---|
| Warm fintech landing | `fintech website` | `editorial finance website`, `serif headline landing page`, `warm color palette ui`, `illustrated onboarding app` |
| App onboarding | `onboarding` | `onboarding flow mobile`, `progressive disclosure form`, `empty state illustration` |
| Animated logo, art-directed | `logo animation` | `experimental logo animation`, `kinetic typography logo motion`, `motion identity branding`, `generative identity motion design` |

Run the literal industry query once, mostly to see what to avoid.

**Taste.** Galleries that reward client-pitch polish (Dribbble especially) skew
to slick, interchangeable work. For mood and art direction, lead with Pinterest
and Behance, and use art-leaning words: *experimental, kinetic, generative,
editorial, poster*.

## Looking

You can't judge from titles. Download thumbnails (small sizes) and review many at
once on a contact sheet:

```bash
# normalise first — mixed pixel formats make the tiler silently drop frames
for f in th/*.jpg; do ffmpeg -loglevel quiet -y -i "$f" \
  -vf "scale=170:212:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=170:212:-1:-1:color=gray,format=yuvj420p" \
  "n/$(basename "$f")"; done
# one sheet per 50: copy the batch into its own folder as 001..050, then
ffmpeg -loglevel error -y -framerate 1 -i batch/%03d.jpg -vf "tile=10x5:padding=4:color=red" -frames:v 1 sheet.jpg
```

Gotchas: `-start_number` with tiling is unreliable, so copy each batch into its
own folder. A short final batch emits nothing, so pad it to a full tile.

**Motion:** one frame is often blank or misleading. Build a 5–6 frame filmstrip
per clip and read those:

```bash
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 in.mp4)
ffmpeg -loglevel quiet -y -i in.mp4 -vf "fps=5/${d%.*},scale=150:150:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=150:150:-1:-1,format=yuvj420p,tile=5x1" -frames:v 1 strip.jpg
```

Cut anything generic, off-mood or near-duplicate. Keep 12–24.

## Grouping and notes

Group by what the reference teaches, not by source: "Liquid & chrome", "Type
under force", "Systems from pixels & points". Two to five groups, each with a
one-line note.

Each pick gets a `why`: one concrete sentence about what to take from it.
- Weak: "Nice design."
- Good: "Oversized serif numerals make the rate the hero, so the UI around it can stay quiet."

Describe only motion you actually saw in the filmstrip.
