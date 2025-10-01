# Overview

A custom Lovelace card for Home Assistant that provides an intuitive interface for controlling air conditioners. Designed specifically for panel displays with support for climate entities, fan speeds, swing positions, ceiling fans, and theme customization.

# Features

* Control your AC locally via Home Assistant
* Large temperature display optimized for panel viewing
* Separate control for AC fan speed and swing (via select entities)
* Ceiling fan controls with configurable script buttons (OFF, 1-6)
* Theme support with automatic color adaptation
* Current, target, and outside temperature display
* Works with standard climate entities and select entities
* Compact design perfect for 480x480px panels
* Visual configuration editor included

# Supported hardware

This card is designed for Home Assistant Lovelace dashboards and works with:

* Any Home Assistant climate entity
* Select entities for fan speed control
* Select entities for swing control
* Sensor entities for outside temperature
* Script entities for ceiling fan control

Works best with Panasonic AC units controlled via [esphome-panasonic-ac](https://github.com/DomiStyle/esphome-panasonic-ac).

# Requirements

* Home Assistant 2023.1.0 or newer
* A climate entity (e.g., `climate.living_room_ac`)
* Optional: Select entities for fan and swing control
* Optional: Sensor entity for outside temperature
* Optional: Script entities for ceiling fan control

# Notes

* **This is a frontend Lovelace card, not a Home Assistant integration**
* **Make sure your climate entity supports the features you want to use**
* **Select entities should be used for fan speed and swing control when using ESPHome-based AC controllers**

# Software installation

This installation guide assumes some familiarity with Home Assistant and Lovelace.

## Manual Installation

* Download the `ac-panel.js` file from this repository
* Place it in your Home Assistant `www` directory (create it if it doesn't exist: `/config/www/`)
* Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/ac-panel.js
    type: module
```

* Restart Home Assistant or reload Lovelace resources
* The card will be available in the card picker as "AC Panel Card"

## HACS Installation

* Open HACS in your Home Assistant instance
* Click on "Frontend"
* Click the "+" button
* Search for "Air Conditioner Panel" or add custom repository: `https://github.com/beebop5/ac-panel`
* Click "Install"
* Add the resource configuration as shown above
* Restart Home Assistant or reload Lovelace resources

## Basic Configuration

Add the card to your dashboard using the visual editor or manually:

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
```

## Full Configuration Example

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
name: Living Room AC
theme: default

# Optional separate select entities (recommended for ESPHome)
fan_entity: select.living_room_fan_speed
swing_entity: select.living_room_swing_mode

# Optional outside temperature sensor
outside_temp_entity: sensor.outside_temperature

# Hide sections you don't need
hide_temperature: false
hide_mode: false
hide_fan_speed: false
hide_swing: false

# Customize available modes
modes:
  - cool
  - heat
  - fan_only
  - auto
  - dry

# Customize available fan speeds (match your select entity options)
fan_speeds:
  - auto
  - low
  - medium
  - high

# Customize available swing modes (match your select entity options)
swing_modes:
  - off
  - horizontal
  - vertical
  - both

# Ceiling fan controls (optional)
ceiling_fan_scripts:
  off: script.ceiling_fan_off
  speed1: script.ceiling_fan_1
  speed2: script.ceiling_fan_2
  speed3: script.ceiling_fan_3
  speed4: script.ceiling_fan_4
  speed5: script.ceiling_fan_5
  speed6: script.ceiling_fan_6
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Climate entity ID (e.g., `climate.living_room_ac`) |
| `name` | string | Entity name | Custom name for the card |
| `theme` | string | `default` | Theme name for color scheme |
| `fan_entity` | string | - | Select entity for fan speed control |
| `swing_entity` | string | - | Select entity for swing control |
| `outside_temp_entity` | string | - | Sensor entity for outside temperature |
| `hide_temperature` | boolean | `false` | Hide temperature controls |
| `hide_mode` | boolean | `false` | Hide mode selection |
| `hide_fan_speed` | boolean | `false` | Hide fan speed controls |
| `hide_swing` | boolean | `false` | Hide swing controls |
| `modes` | array | See example | Available HVAC modes |
| `fan_speeds` | array | See example | Available fan speeds |
| `swing_modes` | array | See example | Available swing modes |
| `ceiling_fan_scripts` | object | - | Script entities for ceiling fan buttons |

## Setting up with ESPHome Panasonic AC

If you're using [esphome-panasonic-ac](https://github.com/DomiStyle/esphome-panasonic-ac), configure select entities for fan and swing:

```yaml
# ESPHome configuration
select:
  - platform: template
    name: "Living Room Fan Speed"
    id: fan_speed_select
    options:
      - auto
      - low
      - medium
      - high
    optimistic: true

  - platform: template
    name: "Living Room Swing Mode"
    id: swing_mode_select
    options:
      - off
      - horizontal
      - vertical
      - both
    optimistic: true
```

Then reference these in your card:

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
fan_entity: select.living_room_fan_speed
swing_entity: select.living_room_swing_mode
```

## Theme Support

Available themes:
* `default` - Blue theme
* `green` - Green theme
* `orange` - Orange theme
* `purple` - Purple theme

Themes automatically adjust:
* Primary color
* Secondary color
* Text color
* Border color
* Background color

## Ceiling Fan Controls

Configure up to 7 ceiling fan buttons (OFF + 6 speed levels):

```yaml
ceiling_fan_scripts:
  off: script.ceiling_fan_off
  speed1: script.ceiling_fan_low
  speed2: script.ceiling_fan_medium_low
  speed3: script.ceiling_fan_medium
  speed4: script.ceiling_fan_medium_high
  speed5: script.ceiling_fan_high
  speed6: script.ceiling_fan_max
```

Create corresponding scripts in Home Assistant:

```yaml
script:
  ceiling_fan_off:
    sequence:
      - service: switch.turn_off
        target:
          entity_id: switch.ceiling_fan
  
  ceiling_fan_low:
    sequence:
      - service: fan.set_percentage
        target:
          entity_id: fan.ceiling_fan
        data:
          percentage: 16
```

# About

Custom Lovelace card for Home Assistant that provides intuitive air conditioner control optimized for panel displays.

### Resources

* [Installation Guide](#software-installation)
* [Configuration](#configuration-options)
* [GitHub Repository](https://github.com/beebop5/ac-panel)
* [Report Issues](https://github.com/beebop5/ac-panel/issues)

### License

MIT License

### Languages

* JavaScript 100%
