---
name: design-inspiration
description: Go find visual references and build a curated, self-contained HTML moodboard from Pinterest, Behance, Dribbble, Awwwards and other galleries (still images or looping video) — use when: find references, look for inspiration, make a moodboard, visualize a brand mood, brand or product inspiration, what are others doing, refs for this screen, motion references, animated logo inspiration
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebFetch
  - WebSearch
  - AskUserQuestion
---
<context>
Researches visual references for a brief and turns them into a board a designer can think with: 12–24 picks, grouped by what each one teaches, each with one line on what to take from it. Output is one HTML file with every image and clip embedded, so it opens offline and can be emailed.

Useful at any stage of brand or product work: seeing a mood direction before committing to it, comparing identity directions side by side, or finding product UI and motion references for a specific screen.
</context>

<objective>
Research, curate and package visual references for a brief.

**Input:** A brief (what it's for, mood words, constraints), optionally seed links
**Output:** `{OUT}/moodboard-{slug}/` with `moodboard.html`, `manifest.json`, `media/`
</objective>

<rules>
- Always use `AskUserQuestion` for user interaction — never prompt via plain text
- One decision per question — never batch multiple questions in a single message
- Look at every candidate before keeping it — titles and tags can't tell you if something is good
- Read only on the user's accounts: never save, pin, like, follow or comment unless asked for that exact action
- Never get past a CAPTCHA, Cloudflare check or login wall — that source needs the user's browser
- Credit every pick; name an author only when the source names one
- Close any browser tabs you opened
</rules>

<process>
## Step 0: Output

Save next to the work the board supports: an existing `references/`, `research/` or `.design/` folder in the project. With no obvious home, use `./moodboards`. Set `OUT`.

## Step 1: Brief

Get: what it's for (brand, landing page, app screen, motion; web and app if the product has both), 3–5 mood words, hard constraints (brand colors, type, things to avoid), and still vs motion. Seed from any brand or project docs in the repo, then ask only for what's missing, one question at a time. If the user is away, infer and record assumptions in the manifest.

## Step 2: Search angles

Read `${CLAUDE_SKILL_DIR}/curation.md` § Angles. Turn the brief into 3–6 queries aimed at qualities, not industries.

## Step 3: Gather

Read `${CLAUDE_SKILL_DIR}/sources/README.md` and pick sources per angle, then read only those sources' playbooks (`sources/{source}.md`).

**Connect the browser first.** Pinterest, Behance, Dribbble and the curated galleries need the user's own Chrome. Check the connection (e.g. Claude in Chrome's tab-context call). If it isn't connected, use `AskUserQuestion`:
- **Help me connect** — walk the user through `${CLAUDE_SKILL_DIR}/setup.md` step by step, then re-check
- **Continue without a browser** — WebFetch/curl sources only (Awwwards, Fonts In Use); say what the board will miss

With the browser connected, lead with Pinterest and Behance for mood and art direction. When Pinterest shows a login wall, ask the user to sign in in your tab and wait.

Collect roughly 3× what you'll keep, with image or video URLs, source links and any named author.

## Step 4: Curate

Follow `${CLAUDE_SKILL_DIR}/curation.md` § Looking: download thumbnails, review them as contact sheets (filmstrips for motion), cut the generic, off-mood and near-duplicate. Keep 12–24. Group into 2–5 sets by what they teach, and write one concrete `why` per pick.

## Step 5: Build

Write `{OUT}/moodboard-{slug}/manifest.json` (schema: `${CLAUDE_SKILL_DIR}/manifest.md`). For motion, shrink clips into `media/` first (see manifest.md). Then:

```bash
node ${CLAUDE_SKILL_DIR}/bin/build-moodboard.js {OUT}/moodboard-{slug}/manifest.json -o {OUT}/moodboard-{slug}/moodboard.html
```

If the browser tools can't open `file://`, serve the folder on `127.0.0.1`, screenshot to check, then stop the server.

## Step 6: Hand off

Report the path, the groups, how many picks, and anything you couldn't reach. If other agents will use the board, point them at `manifest.json` (groups and `why` lines), never the HTML, which is megabytes of embedded media. Offer to narrow the board (a brand, seed pins, one group).
</process>
