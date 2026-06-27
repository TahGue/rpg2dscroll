# Malik — Desert Defense RPG

A 2D side-scrolling desert defense RPG web game. Play as Malik, an Arab desert warrior defending camps, gates, and caravans from enemy waves.

## Stack

- **Client:** React, TypeScript, Vite, TailwindCSS, Zustand, Phaser 3
- **Server:** Node.js, Express, Prisma, SQLite (local) / PostgreSQL (production)
- **Shared:** Common types, mission data, enemy data, upgrade data

## Getting Started

```bash
npm install
cp server/.env.example server/.env
npm run db:push
npm run dev          # client only (http://localhost:5173)
npm run dev:server   # API (http://localhost:3001)
```

For cloud save, run both client and server. The client proxies `/api` to the server.

```bash
npm test             # shared progression tests
npm run build        # client + server production build
```

## World Map

The campaign uses a **node-based desert journey** (React + SVG):

- Click locations on the parchment map to read mission briefings
- **Scroll to zoom**, **drag to pan**, or use the +/−/⌂ controls (mobile-friendly)
- Locked / unlocked / completed / current objective states
- Malik’s marker shows the next story mission
- Side panel: objective, enemies, rewards, and **Start Mission**
- Camp, shop, resource nodes, lore sites, and boss gates across 4 regions and 5 acts

## Mission Types

| Type | Gameplay |
|------|----------|
| `gate_defense` | Hold the gate; build at sockets between waves |
| `survive` | Hold until sunrise after clearing waves |
| `oasis` | Defend the well; oasis heal zone near Malik |
| `ambush` | No gate — Malik fights in the open (Bandit Road) |
| `caravan` | Escort the caravan; build mid-route; reach exit after waves |
| `shrine` | Dual-sided spawns; defend the sacred shrine |
| `boss` | Clear waves then slay the boss to win |

## Controls (Mission)

Rebind keys in **Settings → Controls** (Escape cancels listening). Defaults:

| Key | Action |
|-----|--------|
| A / D / ← / → | Move |
| W / Space / ↑ | Jump |
| J | Sword attack |
| K | Block |
| Shift | Dodge |
| U | Shield Bash |
| I | Sand Slash (unlock) |
| O | Bow (unlock) |
| H | Spear (unlock) |
| T | War Cry (Sun Strike relic) |
| G | Sentinel Shield (relic) |
| R | Repair gate/well/caravan (near target) |
| B | Build at socket (near socket) |
| N | Cycle build type |
| L | Lion roar (unlock lion) |
| P | Pause |

Touch controls are available on mobile.

## Meta Progression

- **World map:** 10 missions across 5 acts, resource nodes, shop, camp, lore
- **Upgrades:** Malik stats, gate, towers, lion, skills
- **Camp upgrades:** Well, war camp, gate workshop, palm timbers (wood), lion den, merchant tents
- **Relics:** Shrine-unlocked powers — block boost, war cry, sentinel shield, regen, boss ward
- **Inventory & crafting:** Consumables from shop/missions/crafting; use at camp before missions
- **New Game+:** After defeating the Shadow Emir — harder enemies, +10% rewards, mission map reset (keeps upgrades)

## Defense Systems

- **Build sockets:** Arrow tower, spike trap, barricade, repair station, iron tower, lion den (unlock by progression)
- **Prep phase:** Short build/repair window before wave 1
- **Hazards:** Soft sand, wind gusts, poison pools, oasis heal, relic pulse
- **Eclipse darkness:** Black Eclipse & Shadow Emir — stand near the gate for relic light
- **Boss phases:** Shadow Emir summons wraiths, shadow-dashes, and enrages at half HP

## Save Data

- **Local save** in browser storage (auto)
- **Cloud save** when logged in (server sync + merge)
- **Export / Import** JSON backups in Settings
- **Key rebinding** stored in save settings

## Materials

- **Gold** — upgrades and shop
- **Water** — camp & relic upgrades
- **Iron** — camp upgrades, crafting
- **Leather** — camp upgrades, crafting
- **Wood** — palm timbers camp upgrade (from wood grove node)
