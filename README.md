# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Unge32/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Unge32/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all **55 Grand Theft Auto VI trophies** on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze): the official list with saved progress, filters and a spoiler setting, a five-stage roadmap to the platinum, the nine missable trophies flagged, and a cited guide for every trophy.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly in a browser. No build step, no network: every file the app loads lives under `app/`, and it works with the network off.

## What it does

- **Checklist** — tick trophies off as you earn them; progress is saved in the browser (localStorage) with a progress bar and per-grade counts.
- **Search & filters** — search by name, description or guide; filter by grade (platinum/gold/silver/bronze), kind (story, missable, collectibles, activities, side missions, combat & heists, open world, money & property, 100% completion) and status (earned / not earned yet).
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned (on by default).
- **Trophy guides** — click any trophy for its full guide beside the list: what to do, where and when, whether it can be missed, the count PlayStation tracks, and the sources for each fact.
- **Platinum roadmap** — five stages in play order (story → strangers & side missions → activities & skills → collectibles & the map → money, mayhem & cleanup), each with its own progress.
- **Missables** — the 9 trophies flagged missable from their official descriptions, with what to do when the chance comes.
- **Export / import** — download your progress as JSON and import it back on any device. Reset clears it.
- **Light & dark themes** — the theme, spoiler and guide settings are saved too.

## Sources & honesty

Trophy names, descriptions and grades are the official PlayStation 5 list as published, from the two public listings that agreed on all 55 on 18 November 2026: **Exophase** (exophase.com/game/grand-theft-auto-vi-psn/trophies) and **PSNProfiles** (psnprofiles.com/trophies/43531-grand-theft-auto-vi), which also supplies the counts PlayStation tracks. Every guide is written in our own words from those official descriptions and counts — no other guide's text is copied, and where a step or place is not pinned down by the official description the guide says so instead of inventing a location. Missable flags are judged from the descriptions alone and are labelled as unconfirmed in-game. There are no online trophies in the official list. No Rockstar Games logo, artwork, box art or game screenshot is used.

## Entry plumbing

`main.ts` (Node 22, standard library only) hands the entry in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, the kit's copy, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`shots.json` records which view each screenshot shows.

## License

MIT — see `LICENSE`. Unofficial fan guide, not affiliated with or endorsed by Rockstar Games.
