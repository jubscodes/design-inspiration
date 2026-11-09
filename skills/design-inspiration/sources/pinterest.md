# Pinterest

**Best for:** mood, art direction, texture, photography, experimental type and
logo motion. It's the strongest source when taste matters.

**Access:** the browser, with the user logged in. Plain fetches return an empty
JavaScript shell, logged-out search shows a login wall, and the official API
can't search public pins.

## Before you start

1. Check the browser is connected (see [../setup.md](../setup.md)).
2. Open your own tab at `https://www.pinterest.com/`. If the login modal
   appears, ask the user to sign in in that tab, and wait. Never type credentials.
3. Results are personalised to the user's account. That's a feature: it
   reflects their taste.

## Searching

- URL: `https://www.pinterest.com/search/pins/?q=<query>` (regional domains such
  as `br.pinterest.com` work too).
- Use art-leaning queries, for example `experimental logo animation`,
  `kinetic typography logo motion`, `motion identity branding`,
  `generative identity motion design`, `editorial layout poster`.
- "More like this" on a strong pin often beats a new query.
- To work from the user's own boards, open the board URL and use the same
  extraction.

## Extracting pins

The grid is virtualised: only on-screen pins exist in the DOM.

1. Scroll in steps of about 0.9 × the viewport height. After each step, collect
   `div[data-grid-item="true"]` items and add them to a store in `sessionStorage`.
2. Skip sponsored pins. Their text contains "Promoted" or a local equivalent
   (for example "Patrocinado").
3. For each pin, keep the ID (from `a[href*="/pin/"]`), the 32-hex hash from its
   image URL, and whether it shows a duration badge (`0:12`), which marks a video.

Rebuild thumbnails from the hash. `aa/bb/cc` are the hash's first six characters:
- images: `i.pinimg.com/236x/aa/bb/cc/<hash>.jpg` (or `736x` for larger)
- video posters: `i.pinimg.com/videos/thumbnails/originals/aa/bb/cc/<hash>.0000000.jpg`

## Video files

Guessed `v1.pinimg.com` URLs return 403. To get the real one, run
`fetch('/pin/<id>/')` from inside the page and search the HTML for
`v1.pinimg.com/videos/...mp4`:
- prefer `iht/expMp4/..._720w.mp4` (H.264), then `720p`
- avoid `hevc` and `h265`, which many players can't decode

Once you have the real URL, curl downloads it directly.

## Credits

In the pin HTML, `full_name` is the **logged-in viewer**, not the author. Credit
from the pin's `title` or `grid_title` and its `link`, which points to the
original post (often Instagram or Behance). If neither names a creator, write
"via Pinterest" and link the pin.

## Limits

- Results are personalised and change between sessions.
- Many pins are reposts. Follow `link` to the original where you can.
