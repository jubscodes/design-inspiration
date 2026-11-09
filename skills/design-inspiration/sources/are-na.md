# Are.na

**Best for:** curated research channels: designers' own collections around a
theme, often with less mainstream references.

**Access:** the v2 search API (`https://api.are.na/v2/search/blocks?q=<q>`) returned
403 without a token in November 2026.

- **With a token:** if the user provides a personal access token from
  `are.na/developers`, send it as `Authorization: Bearer <token>`. Read it from
  an environment variable, and never write it into files or the manifest.
- **Without a token:** browse `are.na/search/<query>` in the browser.

## Credits

Blocks link to their original source, and channels name their curator. Credit
the original creator first.
