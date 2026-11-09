# Awwwards

**Best for:** whole websites at award-level craft, covering layout, navigation,
scroll and page motion.

**Access:** WebFetch or curl. No browser and no login needed, and listings are
server-rendered.

## URLs

- Search: `https://www.awwwards.com/websites/?text=<query>`
- Search plus colour: `...&palette=%23B42625`
- Tag, category or technology: `/websites/<slug>/`, for example `/websites/3d/`, `/websites/webgl/`
- Award tiers: `/websites/nominees/`, `/websites/honorable/`
- Entry: `/sites/<slug>`

## Extracting

WebFetch shows placeholder thumbnails because they're lazy-loaded. The real URLs
are in `data-srcset` in the raw HTML:

```bash
curl -s "https://www.awwwards.com/websites/?text=editorial" \
  | grep -oE 'data-srcset="[^"]+"' | grep -oE 'https://[^ ]+thumb_880_660[^ ]+'
```

`thumb_880_660` is the 2× size. An entry page's `og:image` is the full
screenshot. Get names, entry links and live-site URLs with WebFetch. Both
appear in page order.

## Credits

Entry pages name the studio. Link the entry and the live site.

## Limits

- `?text=` matches site names and descriptions, not what's on screen, so
  results can be noisy.
- Thumbnails are static, which makes it weak for motion briefs such as logos
  and transitions.
- Promoted items (ads) are mixed into the listings. Drop them.
