# Dribbble

**Best for:** product UI details, app screens, icon and logo reveals. It leans
towards polished, client-pitch work, which reads as generic for brand or art
direction.

**Access:** the browser. Search is public, no login needed.

## Searching

- URL: `https://dribbble.com/search/<query-with-dashes>`
- Reject the cookie banner first.

## Extracting

Each `li[id^="screenshot-"]` holds:
- the shot link (`a[href*="/shots/"]`) and the author (`.display-name`)
- a still: `cdn.dribbble.com/userupload/<id>/file/still-<hash>.png`
- for motion shots, `[data-video-teaser-small|medium|large]`: an mp4 of about
  20–700 KB, small enough to embed directly

Strip query strings from the CDN URLs before returning them (see
[README.md](README.md)), then download them from `cdn.dribbble.com` with curl.

## Credits

The author name sits on each card. Link the shot page.

## Limits

- `still-*.gif` files are usually a single frame, not an animation. Check the
  duration with ffprobe.
- Ads are mixed into the grid. Skip cards without a `/shots/` link.
