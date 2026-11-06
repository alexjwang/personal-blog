---
# Outings are written in the Obsidian vault (desk/writing/catches, from templates/Catch Outing.md) and copied
# here by the vault's scripts/publish-catches script. Edit them there, not in _catches/.
# Two outings on one day: name them YYYY-MM-DD-1-..., YYYY-MM-DD-2-... in the order they happened.
date: 2026-10-10
day: 95                        # noncompete day number, optional
area: "Akan"                   # a map mark from _data/places.yml
water: "Akan river"            # any river or lake name; new ones appear under their area on their own
guide: "Sapporo Streams"
conditions: "overcast, low clear water, caddis hatch at dusk"
fish:                          # species ids from _data/species.yml
  - "rainbow 3"                # exact count
  - "iwana 2+"                 # at least
  - "yamame ~5"                # about
  - "amemasu"                  # at least one
biggest:
  - "rainbow 52"               # cm
flies:
  - "elk caddis"
lost:
  - "rainbow: big one, broke off at the net"
photos:
  - "/assets/catches/photos/2026-10-10/img_0412.jpg | the 52"   # _tools/sort-catch-photos.mjs --copy prints the path
post: "[[2026-10-16-noncompete-logs-10]]"   # the log post's file name, as an Obsidian link
skunked: false                 # true for a day with no fish
---
Notes in normal markdown. A line starting with > becomes an aside in the blog's blockquote style.

> the one that made the day.
