# Passable Vacuum Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![release](https://img.shields.io/github/v/release/GBear09/passable-vacuum-card?include_prereleases&color=blue)](https://github.com/GBear09/passable-vacuum-card/releases)
[![license](https://img.shields.io/github/license/GBear09/passable-vacuum-card)](LICENSE)

A custom Lovelace robot vacuum card aligned with the Passable design system (`passable-hvac-card`, `passable-vehicle-card`, and `passable-lighting-card`), tailored with deep support for Roborock Q Revo robots and multifunctional docks.

---

## Features

- **Map & Summary Display Modes**:
  - `display_mode: "full"` (default) displays the interactive map card inline with **Map**, **Controls & Dock**, **Schedule**, and **Health** tabs.
  - `display_mode: "summary"` renders a compact overview card (`hero` or `rings` layout) with a status strip, Roborock Q Revo graphic, expandable details tray, routine footer chips, and a swipeable 4-tab Command Center popup.
- **Multifunctional Dock & Cleaning Mode Controls**: Toggle **Wash Mops**, **Empty Dustbin**, **Dry Mops**, **Resolve Dock Error**, **Locate Robot**, and **Cleaning Mode** (`Vac & Mop`, `Vacuum`, `Mop`, `Custom`).
- **Dynamic Multi-Floor Map Switching**: Automatically matches `select.*_selected_map` floors to their corresponding `image.*_custom` map entities with toolbar floor pills.
- **Schedules, Post-Dinner & DND**: Manage 7-day routines, post-dinner cleanups, and Do Not Disturb windows.
- **Consumable Health & Overdue Alerts**: Clamped progress bars with clear **Overdue** badges, reset buttons, hardware attachment sensors, and lifetime cleaning totals.

---

## Usage

### Full Interactive Map Card (Default)

```yaml
type: custom:passable-vacuum-card
entity: vacuum.roborock_q_revo
map_camera: image.roborock_q_revo_downstairs_custom
```

### Compact Overview Summary Card

```yaml
type: custom:passable-vacuum-card
display_mode: summary
layout: hero
entity: vacuum.roborock_q_revo
map_camera: image.roborock_q_revo_downstairs_custom
show_header: false
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
