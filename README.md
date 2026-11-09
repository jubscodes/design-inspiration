# design-inspiration

An agent skill that finds visual references and turns them into a curated
moodboard: 12–24 picks, grouped by what each one teaches, each with one line on
what to take from it. The board is a single HTML file with every image and
looping clip embedded, so it opens offline and can be emailed.

It reads Pinterest (in your own logged-in browser), Behance, Dribbble, Awwwards,
Fonts In Use and other galleries. It reviews candidates on contact sheets, and
on frame-by-frame filmstrips for motion, before keeping anything.

## Install

```bash
npx skills add jubscodes/design-inspiration
```

Or copy `skills/design-inspiration/` into `~/.claude/skills/` (or your
project's `.claude/skills/`).

## Use

Ask for references in plain words:

> find inspiration for an animated logo, art-directed, not product polish

> make a moodboard for a warm, editorial fintech landing page

> what are others doing for empty states in onboarding?

## Requirements

- **Node 18+**. The board builder (`bin/build-moodboard.js`) uses Node builtins only.
- **ffmpeg** (recommended) for contact sheets, filmstrips and shrinking media. On
  macOS, `sips` is used if ffmpeg is missing.
- **Claude in Chrome** for Pinterest, Behance, Dribbble and the curated galleries.
  [`setup.md`](skills/design-inspiration/setup.md) walks you through connecting it.
  Without it, the skill uses Awwwards and Fonts In Use only.

## What's inside

```
skills/design-inspiration/
├── SKILL.md            the workflow
├── setup.md            connecting your browser (Claude in Chrome)
├── curation.md         search angles, contact sheets, grouping, notes
├── manifest.md         board format + shrinking media
├── sources/            one playbook per source
│   ├── pinterest.md  behance.md  dribbble.md  awwwards.md
│   ├── fonts-in-use.md  galleries.md  are-na.md
│   └── README.md       which source for what + shared browser rules
└── bin/build-moodboard.js
```

## Part of GSP

This skill also ships inside [get-shit-pretty](https://github.com/jubscodes/get-shit-pretty)
as `/gsp-design-inspiration`. There it's wired into the brand and product
pipelines: it reads the brand's mood direction as its brief, and the identity and
design agents read the boards it saves.

## A note on references

Boards collect other people's work for inspiration. The skill credits every pick
and links to the original. Keep boards for your own research, and don't present
the work as yours.

## License

MIT
