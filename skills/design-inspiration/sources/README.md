# Sources

One playbook per source. Read only the ones you're using.

| Source | Best for | Access | Playbook |
|---|---|---|---|
| Pinterest | Mood, art direction, texture, motion GIFs and video | Browser, user logged in | [pinterest.md](pinterest.md) |
| Behance | Brand identities, motion branding case studies | Browser, public | [behance.md](behance.md) |
| Dribbble | UI shots, polished logo reveals (leans commercial) | Browser, public | [dribbble.md](dribbble.md) |
| Awwwards | Whole websites, layout, site motion | WebFetch or curl | [awwwards.md](awwwards.md) |
| Fonts In Use | Real-world type pairings | WebFetch or curl | [fonts-in-use.md](fonts-in-use.md) |
| Godly, Land-book, Lapa Ninja, Mobbin | Landing pages, app flows | Browser only | [galleries.md](galleries.md) |
| Are.na | Curated research channels | Token or browser | [are-na.md](are-na.md) |

**Browser** means the user's own Chrome through Claude in Chrome. If it isn't
connected, walk the user through [../setup.md](../setup.md) before giving up on
browser sources.

**Choosing by taste:** for mood and art direction, lead with Pinterest and
Behance. Dribbble suits product UI but reads as generic for brand work. Awwwards
and Fonts In Use work without a browser.

## Browser extraction, all sources

- Open your **own** tab. Never reuse the user's tabs, and close yours at the end.
- Reject non-essential cookies.
- `javascript_exec` output that contains URLs with query strings may be blocked.
  Strip `?…` before returning URLs.
- Output is cut off at about 1,000 characters. Keep results in a `window`
  variable, or in `sessionStorage` to survive navigation, and read them in chunks
  of 6–15 short rows (IDs and hashes, not full URLs).
- `javascript_exec` times out after about 45 s. Start long loops in an `async`
  IIFE without awaiting them, then check progress.
- Never get past a CAPTCHA, a Cloudflare check or a login wall yourself. Ask the user.
- Stay read-only on the user's accounts: no saving, liking, following or
  commenting unless the user asks for that exact action.

Access notes were verified in November 2026. Sites change, so update the
playbook when something stops working.
