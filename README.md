# Air Conditioner Panel for Home Assistant

A custom Home Assistant dashboard component that provides an intuitive interface for controlling air conditioners with fan speeds, swing positions, and multiple modes. This component mirrors the functionality of the built-in Thermostat card but is specifically designed for air conditioner control.

## Features

- **Temperature Control**: Large, easy-to-read temperature display with +/- buttons
- **Mode Selection**: Support for Cool, Heat, Fan, Auto, and Dry modes
- **Fan Speed Control**: Multiple fan speed options (Auto, Low, Medium, High)
- **Swing Control**: Horizontal, Vertical, and Both swing options
- **Power Toggle**: Easy on/off control
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable**: Hide any control section you don't need
- **Modern UI**: Clean, card-based interface with smooth animations

## Installation

### Method 1: Manual Installation (Recommended)

1. Download the `ac-panel.js` file from this repository
2. Place it in your Home Assistant `www` directory (create it if it doesn't exist)
3. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/ac-panel.js
    type: module
```

4. Restart Home Assistant
5. The card will be available in the card picker as "AC Panel Card"

### Method 2: HACS (If Available)

1. Open HACS in your Home Assistant instance
2. Go to "Explore & Download Repositories"
3. Search for "ac-panel" or add this repository URL: `https://github.com/beebop5/ac-panel`
4. Install the plugin
5. Add the resource to your Lovelace configuration as shown above

## Usage

### Basic Configuration

Add the card to your dashboard using the card picker or add it manually:

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
```

### Advanced Configuration

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
fan_entity: fan.living_room_fan  # Optional: separate fan entity
swing_entity: fan.living_room_swing  # Optional: separate swing entity
name: "Living Room AC"
hide_temperature: false
hide_mode: false
hide_fan_speed: false
hide_swing: false
modes:
  - cool
  - heat
  - fan_only
  - auto
  - dry
fan_speeds:
  - auto
  - low
  - medium
  - high
swing_modes:
  - off
  - horizontal
  - vertical
  - both
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | The climate entity ID to control |
| `fan_entity` | string | `null` | Optional separate fan entity for fan control |
| `swing_entity` | string | `null` | Optional separate swing entity for swing control |
| `name` | string | Entity name | Custom name for the card |
| `hide_temperature` | boolean | `false` | Hide the temperature control section |
| `hide_mode` | boolean | `false` | Hide the mode selection section |
| `hide_fan_speed` | boolean | `false` | Hide the fan speed control section |
| `hide_swing` | boolean | `false` | Hide the swing control section |
| `modes` | array | `['cool', 'heat', 'fan_only', 'auto', 'dry']` | Available HVAC modes |
| `fan_speeds` | array | `['auto', 'low', 'medium', 'high']` | Available fan speeds |
| `swing_modes` | array | `['off', 'horizontal', 'vertical', 'both']` | Available swing modes |

## Supported Entities

This card works with:

**Climate Entities (required):**
- `climate.turn_on` / `climate.turn_off`
- `climate.set_temperature`
- `climate.set_hvac_mode`
- `climate.set_fan_mode` (if no separate fan entity)
- `climate.set_swing_mode` (if no separate swing entity)

**Optional Select Entities:**
- `select.select_option` - for separate fan speed control
- `select.select_option` - for separate swing control

**Configuration Flexibility:**
- **Single Climate Entity**: Use the climate entity for all controls
- **Separate Fan Select**: Use a dedicated select entity for fan speed control
- **Separate Swing Select**: Use a dedicated select entity for swing control
- **Mixed Configuration**: Combine climate entity with separate select entities

## Customization

### CSS Variables

You can customize the appearance using CSS variables:

```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
card_mod:
  style: |
    ha-card {
      --ac-primary-color: #ff6b35;
      --ac-secondary-color: #f8f9fa;
      --ac-text-color: #2c3e50;
      --ac-border-color: #e9ecef;
      --ac-background-color: #ffffff;
    }
```

### Available CSS Variables

- `--ac-primary-color`: Primary color for buttons and active states
- `--ac-secondary-color`: Background color for control sections
- `--ac-text-color`: Main text color
- `--ac-border-color`: Border color for controls
- `--ac-background-color`: Card background color

## Examples

### Minimal Configuration
```yaml
type: custom:ac-panel-card
entity: climate.bedroom_ac
```

### Temperature Only
```yaml
type: custom:ac-panel-card
entity: climate.living_room_ac
hide_mode: true
hide_fan_speed: true
hide_swing: true
```

### Custom Modes
```yaml
type: custom:ac-panel-card
entity: climate.office_ac
modes:
  - cool
  - fan_only
  - auto
fan_speeds:
  - auto
  - low
  - high
```

## Troubleshooting

### Card Not Appearing
- Make sure the component is properly installed
- Check that the entity ID is correct
- Verify the entity is a climate entity
- Restart Home Assistant after installation

### Controls Not Working
- Check that the climate entity supports the required services
- Verify the entity is not in an unavailable state
- Check the Home Assistant logs for any error messages

### Styling Issues
- Clear your browser cache
- Check for conflicting CSS rules
- Verify the CSS variables are properly formatted

## Development

### Building from Source

1. Clone the repository:
```bash
git clone https://github.com/beebop5/ac-panel.git
cd ac_panel
```

2. Install dependencies:
```bash
npm install
```

3. Build the component:
```bash
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/beebop5/ac-panel/issues)
- [Home Assistant Community](https://community.home-assistant.io/)
- [Discord](https://discord.gg/c5DvZ4e)

## Changelog

### v1.0.0
- Initial release
- Basic AC control functionality
- Temperature, mode, fan speed, and swing controls
- Responsive design
- Customizable configuration options
