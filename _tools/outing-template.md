---
# Copy to _catches/YYYY-MM-DD-<water-id>.md. Two outings on one day: add -1-, -2- after the date, in the order they happened.
date: 2026-10-10
day: 95                       # noncompete day number, optional
water: akan-river             # an id from _data/places.yml (add a new water under its area there first)
guide: Sapporo Streams        # optional
conditions: overcast, low clear water, caddis hatch at dusk   # optional, one line
skunked: false                # true for a day with no fish; leaving out `fish` without this reads "not written up yet"
fish:
  - species: rainbow          # an id from _data/species.yml
    count: 3                  # optional; no count means "at least one"
    approx: true              # optional; shows as ~3
    biggest: 52               # optional, in cm
flies: [elk caddis, bead-head nymph]   # optional
lost:                         # optional
  - species: rainbow
    note: big one, broke off at the net
photos:                       # optional; _tools/sort-catch-photos.mjs --copy prints these lines for you
  - src: /assets/catches/photos/2026-10-10/img_0412.jpg
    caption: the 52
sketch: /assets/catches/sketches/2026-10-10.jpg   # optional: a photo of a notebook sketch of the spot
post: /2026/10/14/noncompete-logs-10   # optional: the post's address without .html (its front-matter date wins over the filename's)
---
Notes go here, in normal markdown. A line starting with > becomes an aside (the blog's blockquote style).

> the one that made the day.
