---
# Outings are written in the Obsidian vault (desk/writing/catches, from templates/Catch Outing.md) and copied
# here by the vault's scripts/publish-catches script. Edit them there, not in _catches/.
# One note per fishing day. Two waters in a day go in one note as a `water` list.
date: 2026-10-10
day: 95                        # noncompete day number, optional
area: "Akan"                   # a map mark from _data/places.yml; a list (same order as water) for a day across areas
water:                         # rivers and lakes fished that day; new ones appear under their area on their own
  - "Akan river"
  - "Lake Akan"
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
