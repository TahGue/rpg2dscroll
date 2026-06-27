# Malik RPG Adventure — The Drying Well

A top-down pixel-art adventure RPG vertical slice. Play as Malik, explore Nahran Village and the oasis road, gather resources, craft survival gear, complete village quests, fight desert enemies, and defeat Bandit Captain Rashid to reopen the Oasis Road.

## Stack

- **Client:** React, TypeScript, Vite, TailwindCSS, Zustand, Phaser 3
- **Server:** Node.js, Express, Prisma, SQLite (local) / PostgreSQL (production)
- **Shared:** Common types, overworld data, quest data, inventory, crafting, and progression logic

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

## Demo Loop

The current playable target is:

```text
Nahran Village -> Palm Grove -> Small Oasis -> Hyena Road -> Bandit Camp -> Small Cave
Explore -> Gather -> Craft -> Quest -> Fight -> Upgrade -> Unlock Oasis Road
```

The side-scroll defense mode is no longer player-facing. The game launches into the top-down adventure region and uses RPG quest, inventory, crafting, camp, shop, and encounter systems.

## Controls

Rebind keys in **Settings → Controls** (Escape cancels listening). Defaults:

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E | Interact with NPCs, resources, fishing spots, hunt trails, combat zones, and camp |
| J / Space | Sword or spear attack |
| O | Bow shot, if Malik has a bow and arrows |
| M | Open the desert region map |

Touch controls are available on mobile.

## RPG Systems

- **Quest log:** Tracks The Drying Well, Road Trouble, Bandit Camp, Fisherman's First Catch, Herbalist Medicine, Hunter's Lesson, and Blacksmith's Ore.
- **Gathering:** Palm wood, dry wood, herbs, mint, water flasks, stone, iron ore, fish, hides, meat, rope, feathers, and relic shards.
- **Crafting:** Healing Potion, Arrows x10, Simple Spear, Grilled Fish, Leather Gloves, and Torch.
- **Combat:** Top-down encounter zones for hyenas, bandits, and Bandit Captain Rashid. Gear and health matter before major fights.
- **Camp:** Restores Malik's health/stamina and saves progress.
- **Shops:** Merchant, Herbalist, Fisherman, Hunter, and Blacksmith-flavored goods through the shared vendor catalog.

## Demo Region

- Malik's Camp
- Nahran Village
- Palm Grove
- Small Oasis
- Hyena Road
- Bandit Camp
- Small Cave

## Save Data

- **Local save** in browser storage (auto)
- **Cloud save** when logged in (server sync + merge)
- **Export / Import** JSON backups in Settings
- **Key rebinding** stored in save settings

## Materials

- **Gold** — upgrades and shops
- **Adventure items** — tracked as inventory stacks for weapons, tools, armor, food, potions, materials, quest items, fish, animal parts, and relics
