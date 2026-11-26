# Changelog

All notable changes to **Passable Vacuum Card** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-26

### Added
- **Summary & Map Display Modes**: Added `display_mode: "summary"` (compact Passable tile with summary strip, `hero`/`rings` layouts, expandable quick telemetry tray, footer routine chips, and a swipeable 4-tab Command Center popup) while keeping `display_mode: "full"` (interactive map card) as default.
- **Roborock Q Revo & Multifunctional Dock Support**: Added Cleaning Mode selector (`Vac & Mop`, `Vacuum`, `Mop`, `Custom`), custom Q Revo Robot + Dock SVGs, and all 4 dock controls (`Wash Mops`, `Empty Dustbin`, `Dry Mops` switch, `Resolve Dock Error`), plus `vacuum.locate`.
- **Dynamic Multi-Floor Custom Map Switching**: Automatically pairs `select.*_selected_map` (`Downstairs` / `Upstairs`) with matching floor map `image.*_custom` entities and adds quick floor-switcher pills on the map toolbar.
- **Live Telemetry, DND & Post-Dinner Controls**: Added current room, cleaning progress %, cleaning area/time, lifetime stats, hardware attachment/water-shortage checks, Do Not Disturb schedule + begin/end times, and Post-Dinner cleanup toggle.

### Fixed
- **Negative Consumable Hours**: Clamped consumable progress bars to `0–100%` and replaced negative CSS widths / raw negative hours with clear `Overdue` badges.
- **Empty-String YAML Overrides**: Blank `options` / `sensors` keys now fall back cleanly to auto-discovery.
- **Drying Badge Switch Binding**: Separated `switch.*_dock_mop_drying` from `binary_sensor.*_mop_drying` so toggling drying directly controls the dock.

## [1.0.8] - 2026-10-02

### Changed
- **Local LitElement Extraction**: Replaced external unpkg CDN imports with local Home Assistant prototype extraction (`hui-entities-card`).
- **Container Standardization**: Converted root element to `<ha-card class="container">`.
- **Registry Metadata**: Standardized `window.customCards` configuration with `documentationURL`.
