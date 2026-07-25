# Passable Vacuum Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![release](https://img.shields.io/github/v/release/GBear09/passable-vacuum-card?include_prereleases&color=blue)](https://github.com/GBear09/passable-vacuum-card/releases)
[![license](https://img.shields.io/github/license/GBear09/passable-vacuum-card)](LICENSE)

A feature-packed, interactive custom Lovelace card for robot vacuums in Home Assistant built with LitElement.

---

## Features

- 🧹 **Full Vacuum Controls**: Start, pause, stop, locate, return to dock, and adjust fan speed or mop mode.
- 🗺️ **Interactive Map & Live Camera**: Zoom, pan, target spot cleaning, and draw custom cleaning zones directly on your vacuum map.
- 🏠 **Room & Routine Auto-Discovery**: Automatically discovers rooms and routines from entity attributes and button entities.
- 🔋 **Live Sensor Dashboard**: Real-time status for battery level, clean/dirty water tanks, mop drying timer, dustbin, main brush, side brush, and filter lifespan.
- 🛠️ **Built-in Visual Editor**: Easily configure entity overrides, sensors, buttons, and display preferences through the Home Assistant UI card editor.

---

## Installation

### Method 1: HACS (Recommended)

1. Ensure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance.
2. Go to **HACS** > **Frontend**.
3. Click the three dots in the top right corner and select **Custom repositories**.
4. Add the repository URL:
   `https://github.com/GBear09/passable-vacuum-card`
5. Select Category: **Plugin** (or Dashboard Card).
6. Click **Add**.
7. Search for **Passable Vacuum Card** in HACS and click **Download**.
8. Reload your browser window.

### Method 2: Manual Installation

1. Download `passable-vacuum-card.js` from the [latest release](https://github.com/GBear09/passable-vacuum-card/releases).
2. Copy `passable-vacuum-card.js` into your Home Assistant `<config>/www/` directory.
3. In Home Assistant, go to **Settings** > **Dashboards** > **Three dots (top right)** > **Resources**.
4. Add a new resource:
   - **URL**: `/local/passable-vacuum-card.js`
   - **Resource Type**: `JavaScript Module`

---

## Usage & Configuration

Add the card to your dashboard using the visual UI card editor or directly via YAML:

```yaml
type: custom:passable-vacuum-card
entity: vacuum.robot_vacuum
map_camera: camera.robot_vacuum_map
```

### Advanced YAML Example

```yaml
type: custom:passable-vacuum-card
entity: vacuum.robot_vacuum
map_camera: camera.robot_vacuum_map
schedule_enable: input_boolean.vacuum_schedule_enabled
sensors:
  battery: sensor.robot_vacuum_battery
  charging: binary_sensor.robot_vacuum_charging
  clean_water: sensor.robot_vacuum_clean_water_tank
  dirty_water: sensor.robot_vacuum_dirty_water_tank
  filter: sensor.robot_vacuum_filter_left
  main_brush: sensor.robot_vacuum_main_brush_left
  side_brush: sensor.robot_vacuum_side_brush_left
buttons:
  reset_filter: button.robot_vacuum_reset_filter
  reset_main_brush: button.robot_vacuum_reset_main_brush
  reset_side_brush: button.robot_vacuum_reset_side_brush
```

---

## Configuration Reference

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Yes** | `custom:passable-vacuum-card` |
| `entity` | string | **Yes** | Primary `vacuum` entity ID (e.g. `vacuum.robot_vacuum`) |
| `map_camera` | string | No | Map camera or image entity (e.g. `camera.robot_vacuum_map`) |
| `schedule_enable` | string | No | `input_boolean` entity controlling automated schedule status |
| `selected_map` | string | No | Entity override for map selection |
| `volume` | string | No | Entity override for volume control |
| `sensors` | object | No | Custom entity mappings for battery, water tanks, brushes, and filters |
| `buttons` | object | No | Custom button entity mappings for maintenance resets |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
