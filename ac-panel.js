// Air Conditioner Panel for Home Assistant
// Custom Lovelace card for controlling air conditioners

// Simple template function
const html = (strings, ...values) => {
  return strings.reduce((result, string, i) => result + string + (values[i] || ''), '');
};

// Simple CSS function
const css = (strings, ...values) => {
  return strings.reduce((result, string, i) => result + string + (values[i] || ''), '');
};

// Main AC Panel Component
class AcPanel extends HTMLElement {
  constructor() {
    super();
    this._temperature = 22;
    this._currentTemp = 22;
    this._outsideTemp = null;
    this._currentMode = 'cool';
    this._currentFanSpeed = 'auto';
    this._currentSwing = 'off';
    this._isOn = false;
    this.hide_temperature = false;
    this.hide_mode = false;
    this.hide_fan_speed = false;
    this.hide_swing = false;
    this.fan_entity = null;
    this.swing_entity = null;
    this.outside_temp_entity = null;
    this.ceiling_fan_scripts = {
      off: '',
      speed1: '',
      speed2: '',
      speed3: '',
      speed4: '',
      speed5: '',
      speed6: ''
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        --ac-primary-color: #03a9f4;
        --ac-secondary-color: #f5f5f5;
        --ac-text-color: #333;
        --ac-border-color: #ddd;
        --ac-background-color: #fff;
      }

      /* Theme: Dark */
      :host([theme="dark"]) {
        --ac-primary-color: #4fc3f7;
        --ac-secondary-color: #424242;
        --ac-text-color: #ffffff;
        --ac-border-color: #555;
        --ac-background-color: #303030;
      }

      /* Theme: Light */
      :host([theme="light"]) {
        --ac-primary-color: #2196f3;
        --ac-secondary-color: #f8f9fa;
        --ac-text-color: #212529;
        --ac-border-color: #e9ecef;
        --ac-background-color: #ffffff;
      }

      /* Theme: Blue */
      :host([theme="blue"]) {
        --ac-primary-color: #1976d2;
        --ac-secondary-color: #e3f2fd;
        --ac-text-color: #1565c0;
        --ac-border-color: #bbdefb;
        --ac-background-color: #f3f8ff;
      }

      /* Theme: Green */
      :host([theme="green"]) {
        --ac-primary-color: #388e3c;
        --ac-secondary-color: #e8f5e8;
        --ac-text-color: #2e7d32;
        --ac-border-color: #c8e6c9;
        --ac-background-color: #f1f8e9;
      }

      /* Theme: Red */
      :host([theme="red"]) {
        --ac-primary-color: #d32f2f;
        --ac-secondary-color: #ffebee;
        --ac-text-color: #c62828;
        --ac-border-color: #ffcdd2;
        --ac-background-color: #fff5f5;
      }

      /* Theme: Purple */
      :host([theme="purple"]) {
        --ac-primary-color: #7b1fa2;
        --ac-secondary-color: #f3e5f5;
        --ac-text-color: #6a1b9a;
        --ac-border-color: #e1bee7;
        --ac-background-color: #faf5ff;
      }

      .ac-card {
        background: var(--ac-background-color);
        border-radius: 6px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        padding: 8px;
        font-family: 'Roboto', sans-serif;
        color: var(--ac-text-color);
        max-width: 280px;
        margin: 0 auto;
      }

      .ac-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--ac-border-color);
      }

      .ac-title {
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }

      .ac-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
      }

      .ac-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ac-primary-color);
        animation: pulse 2s infinite;
      }

      .ac-status-indicator.off {
        background: #ccc;
        animation: none;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }

      .ac-controls {
        display: grid;
        gap: 8px;
      }

      .ac-temperature {
        text-align: center;
        margin-bottom: 8px;
      }

      .ac-temp-display {
        font-size: 28px;
        font-weight: 300;
        color: var(--ac-primary-color);
        margin: 0;
        line-height: 1;
      }

      .ac-temp-unit {
        font-size: 12px;
        color: var(--ac-text-color);
        opacity: 0.7;
      }

      .ac-temp-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0;
        font-size: 10px;
        color: var(--ac-text-color);
        opacity: 0.8;
      }

      .ac-temp-current, .ac-temp-outside {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .ac-temp-label {
        font-weight: 500;
      }

      .ac-temp-value {
        font-weight: 600;
        color: var(--ac-primary-color);
      }

      .ac-temp-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      .ac-temp-btn {
        width: 24px;
        height: 24px;
        border: 1px solid var(--ac-primary-color);
        background: transparent;
        border-radius: 50%;
        color: var(--ac-primary-color);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ac-temp-btn:hover {
        background: var(--ac-primary-color);
        color: white;
      }

      .ac-temp-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .ac-section {
        background: var(--ac-secondary-color);
        border-radius: 8px;
        padding: 15px;
      }

      .ac-section-title {
        font-size: 11px;
        font-weight: 500;
        margin: 0 0 4px 0;
        color: var(--ac-text-color);
        opacity: 0.8;
      }

      .ac-options {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .ac-option {
        padding: 4px 8px;
        border: 1px solid var(--ac-border-color);
        background: white;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 10px;
        font-weight: 500;
      }

      .ac-option:hover {
        border-color: var(--ac-primary-color);
        color: var(--ac-primary-color);
      }

      .ac-option.active {
        background: var(--ac-primary-color);
        color: white;
        border-color: var(--ac-primary-color);
      }

      .ac-power-btn {
        width: 100%;
        padding: 8px;
        background: var(--ac-primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 8px;
      }

      .ac-power-btn:hover {
        background: #0288d1;
        transform: translateY(-1px);
      }

      .ac-power-btn.off {
        background: #666;
      }

      .ac-ceiling-fan {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--ac-border-color);
      }

      .ac-ceiling-fan-title {
        font-size: 10px;
        font-weight: 500;
        color: var(--ac-text-color);
        margin-bottom: 6px;
        text-align: center;
      }

      .ac-fan-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }

      .ac-fan-btn {
        padding: 4px 2px;
        border: 1px solid var(--ac-border-color);
        background: var(--ac-background-color);
        border-radius: 4px;
        color: var(--ac-text-color);
        font-size: 9px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .ac-fan-btn:hover {
        border-color: var(--ac-primary-color);
        color: var(--ac-primary-color);
      }

      .ac-fan-btn.active {
        background: var(--ac-primary-color);
        color: white;
        border-color: var(--ac-primary-color);
      }

      .ac-fan-btn.off {
        grid-column: 1 / -1;
        margin-bottom: 2px;
      }

      .ac-power-btn.off:hover {
        background: #555;
      }

      @media (max-width: 480px) {
        .ac-card {
          margin: 10px;
          padding: 15px;
        }
        
        .ac-temp-display {
          font-size: 36px;
        }
        
        .ac-options {
          justify-content: center;
        }
      }
    `;
  }

  connectedCallback() {
    this._updateState();
    this._render();
  }

  _updateState() {
    if (!this.hass || !this.entity) return;

    const state = this.hass.states[this.entity];
    if (!state) return;

    this._isOn = state.state === 'on';
    this._temperature = state.attributes.temperature || 22;
    this._currentTemp = state.attributes.current_temperature || state.attributes.temperature || 22;
    this._currentMode = state.attributes.hvac_mode || 'cool';
    
    // Check for outside temperature entity
    if (this.outside_temp_entity && this.hass.states[this.outside_temp_entity]) {
      const outsideState = this.hass.states[this.outside_temp_entity];
      this._outsideTemp = parseFloat(outsideState.state) || null;
    } else {
      this._outsideTemp = null;
    }
    
    // Check for separate fan entity (select)
    if (this.fan_entity && this.hass.states[this.fan_entity]) {
      const fanState = this.hass.states[this.fan_entity];
      this._currentFanSpeed = fanState.state || 'auto';
    } else {
      this._currentFanSpeed = state.attributes.fan_mode || 'auto';
    }
    
    // Check for separate swing entity (select)
    if (this.swing_entity && this.hass.states[this.swing_entity]) {
      const swingState = this.hass.states[this.swing_entity];
      this._currentSwing = swingState.state || 'off';
    } else {
      this._currentSwing = state.attributes.swing_mode || 'off';
    }
  }

  _callService(service, data = {}) {
    if (!this.hass) {
      console.error('AC Panel: hass object is not available');
      return;
    }
    this.hass.callService('climate', service, {
      entity_id: this.entity,
      ...data
    });
  }

  _togglePower() {
    this._callService(this._isOn ? 'turn_off' : 'turn_on');
  }

  _setTemperature(temp) {
    this._callService('set_temperature', { temperature: temp });
  }

  _setMode(mode) {
    this._callService('set_hvac_mode', { hvac_mode: mode });
  }

  _setFanSpeed(speed) {
    if (!this.hass) {
      console.error('AC Panel: hass object is not available');
      return;
    }
    
    if (this.fan_entity) {
      // Use separate select entity for fan speed
      this.hass.callService('select', 'select_option', {
        entity_id: this.fan_entity,
        option: speed
      });
    } else {
      // Use climate entity
      this._callService('set_fan_mode', { fan_mode: speed });
    }
  }

  _setSwing(swing) {
    if (!this.hass) {
      console.error('AC Panel: hass object is not available');
      return;
    }
    
    if (this.swing_entity) {
      // Use separate select entity for swing
      this.hass.callService('select', 'select_option', {
        entity_id: this.swing_entity,
        option: swing
      });
    } else {
      // Use climate entity
      this._callService('set_swing_mode', { swing_mode: swing });
    }
  }

  _setCeilingFanSpeed(speed) {
    if (!this.hass) {
      console.error('AC Panel: hass object is not available');
      return;
    }

    const scriptKey = speed === 'off' ? 'off' : `speed${speed}`;
    const script = this.ceiling_fan_scripts[scriptKey];
    
    if (script) {
      // Execute the configured script
      this.hass.callService('script', 'turn_on', {
        entity_id: script
      });
    } else {
      console.warn(`AC Panel: No script configured for ceiling fan speed ${speed}`);
    }
  }

  _render() {
    const defaultModes = ['cool', 'heat', 'fan_only', 'auto', 'dry'];
    const defaultFanSpeeds = ['auto', 'low', 'medium', 'high'];
    const defaultSwingModes = ['off', 'horizontal', 'vertical', 'both'];

    const modes = this.modes || defaultModes;
    const fanSpeeds = this.fan_speeds || defaultFanSpeeds;
    const swingModes = this.swing_modes || defaultSwingModes;
    
    // Check if fan and swing entities are available
    const hasFanEntity = this.fan_entity && this.hass && this.hass.states[this.fan_entity];
    const hasSwingEntity = this.swing_entity && this.hass && this.hass.states[this.swing_entity];
    
    // Parse ceiling fan scripts if provided
    if (this.ceiling_fan_scripts && typeof this.ceiling_fan_scripts === 'string') {
      try {
        this.ceiling_fan_scripts = JSON.parse(this.ceiling_fan_scripts);
      } catch (e) {
        console.warn('AC Panel: Failed to parse ceiling_fan_scripts', e);
        this.ceiling_fan_scripts = {};
      }
    }

    // Apply theme to host element
    if (this.theme) {
      this.setAttribute('theme', this.theme);
    } else {
      this.removeAttribute('theme');
    }

    this.innerHTML = html`
      <style>${AcPanel.styles}</style>
      <div class="ac-card">
        <div class="ac-header">
          <h2 class="ac-title">${this.name || 'Air Conditioner'}</h2>
          <div class="ac-status">
            <div class="ac-status-indicator ${this._isOn ? '' : 'off'}"></div>
            <span>${this._isOn ? 'ON' : 'OFF'}</span>
          </div>
        </div>

        <div class="ac-controls">
          ${!this.hide_temperature ? html`
            <div class="ac-temperature">
              <div class="ac-temp-display">
                ${this._temperature}°<span class="ac-temp-unit">C</span>
              </div>
              <div class="ac-temp-info">
                <div class="ac-temp-current">
                  <span class="ac-temp-label">Current:</span>
                  <span class="ac-temp-value">${this._currentTemp}°C</span>
                </div>
                ${this._outsideTemp !== null ? html`
                  <div class="ac-temp-outside">
                    <span class="ac-temp-label">Outside:</span>
                    <span class="ac-temp-value">${this._outsideTemp}°C</span>
                  </div>
                ` : ''}
              </div>
              <div class="ac-temp-controls">
                <button 
                  class="ac-temp-btn temp-down" 
                  ${!this._isOn ? 'disabled' : ''}
                >
                  −
                </button>
                <button 
                  class="ac-temp-btn temp-up" 
                  ${!this._isOn ? 'disabled' : ''}
                >
                  +
                </button>
              </div>
            </div>
          ` : ''}

          ${!this.hide_mode ? html`
            <div class="ac-section">
              <h3 class="ac-section-title">Mode</h3>
              <div class="ac-options">
                ${modes.map(mode => html`
                  <div 
                    class="ac-option mode-option ${this._currentMode === mode ? 'active' : ''}"
                    data-mode="${mode}"
                  >
                    ${mode.replace('_', ' ').toUpperCase()}
                  </div>
                `)}
              </div>
            </div>
          ` : ''}

          ${!this.hide_fan_speed ? html`
            <div class="ac-section">
              <h3 class="ac-section-title">Fan Speed</h3>
              <div class="ac-options">
                ${fanSpeeds.map(speed => html`
                  <div 
                    class="ac-option fan-option ${this._currentFanSpeed === speed ? 'active' : ''}"
                    data-speed="${speed}"
                  >
                    ${speed.toUpperCase()}
                  </div>
                `)}
              </div>
            </div>
          ` : ''}

          ${!this.hide_swing ? html`
            <div class="ac-section">
              <h3 class="ac-section-title">Swing</h3>
              <div class="ac-options">
                ${swingModes.map(swing => html`
                  <div 
                    class="ac-option swing-option ${this._currentSwing === swing ? 'active' : ''}"
                    data-swing="${swing}"
                  >
                    ${swing.toUpperCase()}
                  </div>
                `)}
              </div>
            </div>
          ` : ''}

          <div class="ac-ceiling-fan">
            <div class="ac-ceiling-fan-title">Ceiling Fan</div>
            <div class="ac-fan-buttons">
              <button class="ac-fan-btn off" data-fan-speed="off">OFF</button>
              <button class="ac-fan-btn" data-fan-speed="1">1</button>
              <button class="ac-fan-btn" data-fan-speed="2">2</button>
              <button class="ac-fan-btn" data-fan-speed="3">3</button>
              <button class="ac-fan-btn" data-fan-speed="4">4</button>
              <button class="ac-fan-btn" data-fan-speed="5">5</button>
              <button class="ac-fan-btn" data-fan-speed="6">6</button>
            </div>
          </div>

          <button 
            class="ac-power-btn power-btn ${this._isOn ? '' : 'off'}"
          >
            ${this._isOn ? 'TURN OFF' : 'TURN ON'}
          </button>
        </div>
      </div>
    `;

    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Temperature controls
    const tempDown = this.querySelector('.temp-down');
    const tempUp = this.querySelector('.temp-up');
    if (tempDown) {
      tempDown.addEventListener('click', () => this._setTemperature(this._temperature - 1));
    }
    if (tempUp) {
      tempUp.addEventListener('click', () => this._setTemperature(this._temperature + 1));
    }

    // Mode controls
    const modeOptions = this.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const mode = option.dataset.mode;
        this._setMode(mode);
      });
    });

    // Fan controls
    const fanOptions = this.querySelectorAll('.fan-option');
    fanOptions.forEach(option => {
      option.addEventListener('click', () => {
        const speed = option.dataset.speed;
        this._setFanSpeed(speed);
      });
    });

    // Swing controls
    const swingOptions = this.querySelectorAll('.swing-option');
    swingOptions.forEach(option => {
      option.addEventListener('click', () => {
        const swing = option.dataset.swing;
        this._setSwing(swing);
      });
    });

    // Ceiling fan buttons
    const fanBtns = this.querySelectorAll('.ac-fan-btn');
    fanBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = e.target.getAttribute('data-fan-speed');
        this._setCeilingFanSpeed(speed);
      });
    });

    // Power button
    const powerBtn = this.querySelector('.power-btn');
    if (powerBtn) {
      powerBtn.addEventListener('click', () => this._togglePower());
    }
  }
}

// Lovelace Card Wrapper
class AcPanelCard extends HTMLElement {
  constructor() {
    super();
    this.config = {};
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        background: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
      }
    `;
  }

  setConfig(config) {
    // Create a completely new config object to avoid "object is not extensible" error
    this.config = JSON.parse(JSON.stringify(config || {}));
    // Don't throw error here - let the render method handle missing entity
    console.log('AC Panel Card: Configuration received', this.config);
    this._render();
  }

  getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement('ac-panel-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:ac-panel-card',
      entity: '',
      name: 'Air Conditioner'
    };
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    if (!this.hass) {
      this.innerHTML = html`
        <style>${AcPanelCard.styles}</style>
        <ha-card>
          <div style="padding: 16px; text-align: center; color: var(--error-color, #f44336);">
            <h3>Configuration Required</h3>
            <p>Please configure this card by selecting an entity.</p>
          </div>
        </ha-card>
      `;
      return;
    }

    if (!this.config.entity) {
      this.innerHTML = html`
        <style>${AcPanelCard.styles}</style>
        <ha-card>
          <div style="padding: 16px; text-align: center; color: var(--error-color, #f44336);">
            <h3>No Entity Selected</h3>
            <p>Please select a climate entity to control your air conditioner.</p>
            <p><em>Click the three dots menu → Edit Card to configure.</em></p>
          </div>
        </ha-card>
      `;
      return;
    }

    const state = this.hass.states[this.config.entity];
    if (!state) {
      this.innerHTML = html`
        <style>${AcPanelCard.styles}</style>
        <ha-card>
          <div style="padding: 16px; text-align: center; color: var(--error-color, #f44336);">
            <h3>Entity Not Found</h3>
            <p>The entity "${this.config.entity}" was not found.</p>
            <p><em>Please check the entity ID and try again.</em></p>
          </div>
        </ha-card>
      `;
      return;
    }

    this.innerHTML = html`
      <style>${AcPanelCard.styles}</style>
      <ha-card>
        <ac-panel
          entity="${this.config.entity}"
          fan_entity="${this.config.fan_entity || ''}"
          swing_entity="${this.config.swing_entity || ''}"
          outside_temp_entity="${this.config.outside_temp_entity || ''}"
          name="${this.config.name || ''}"
          theme="${this.config.theme || ''}"
          hide_temperature="${this.config.hide_temperature || false}"
          hide_mode="${this.config.hide_mode || false}"
          hide_fan_speed="${this.config.hide_fan_speed || false}"
          hide_swing="${this.config.hide_swing || false}"
          modes="${JSON.stringify(this.config.modes || [])}"
          fan_speeds="${JSON.stringify(this.config.fan_speeds || [])}"
          swing_modes="${JSON.stringify(this.config.swing_modes || [])}"
          ceiling_fan_scripts="${JSON.stringify(this.config.ceiling_fan_scripts || {})}"
        ></ac-panel>
      </ha-card>
    `;
    
    // Set the hass property directly on the ac-panel element
    const acPanel = this.querySelector('ac-panel');
    if (acPanel) {
      acPanel.hass = this.hass;
      acPanel._setupEventListeners(); // Ensure event listeners are set up after rendering
    }
  }

  static getConfigElement() {
    return document.createElement('ac-panel-card-editor');
  }
}

// Card Editor
class AcPanelCardEditor extends HTMLElement {
  constructor() {
    super();
    this.config = {};
  }

  setConfig(config) {
    // Create a completely new config object to avoid "object is not extensible" error
    this.config = JSON.parse(JSON.stringify(config || {}));
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this._render();
      this._setupEventListeners();
    }, 0);
  }

  get _entity() {
    return this.config?.entity || '';
  }

  get _fan_entity() {
    return this.config?.fan_entity || '';
  }

  get _swing_entity() {
    return this.config?.swing_entity || '';
  }

  get _name() {
    return this.config?.name || '';
  }

  get _hide_temperature() {
    return this.config?.hide_temperature || false;
  }

  get _hide_mode() {
    return this.config?.hide_mode || false;
  }

  get _hide_fan_speed() {
    return this.config?.hide_fan_speed || false;
  }

  get _hide_swing() {
    return this.config?.hide_swing || false;
  }

  get _theme() {
    return this.config?.theme || '';
  }

  get _outside_temp_entity() {
    return this.config?.outside_temp_entity || '';
  }

  get _fan_script_off() {
    return this.config?.ceiling_fan_scripts?.off || '';
  }

  get _fan_script_1() {
    return this.config?.ceiling_fan_scripts?.speed1 || '';
  }

  get _fan_script_2() {
    return this.config?.ceiling_fan_scripts?.speed2 || '';
  }

  get _fan_script_3() {
    return this.config?.ceiling_fan_scripts?.speed3 || '';
  }

  get _fan_script_4() {
    return this.config?.ceiling_fan_scripts?.speed4 || '';
  }

  get _fan_script_5() {
    return this.config?.ceiling_fan_scripts?.speed5 || '';
  }

  get _fan_script_6() {
    return this.config?.ceiling_fan_scripts?.speed6 || '';
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 16px;
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .config-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--primary-color, #03a9f4);
      }
      
      .config-header h3 {
        margin: 0;
        color: var(--primary-color, #03a9f4);
        font-size: 18px;
        font-weight: 500;
      }
      
      .config-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color, #03a9f4);
      }
      
      .config-section label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .config-section input,
      .config-section select {
        padding: 12px;
        border: 2px solid var(--divider-color, #ddd);
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .config-section input:focus,
      .config-section select:focus {
        border-color: var(--primary-color, #03a9f4);
        outline: none;
        box-shadow: 0 0 0 3px rgba(3, 169, 244, 0.1);
      }
      
      .config-section checkbox {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }
      
      .config-section checkbox input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--primary-color, #03a9f4);
      }
      
      .config-section checkbox label {
        margin: 0;
        cursor: pointer;
        font-size: 14px;
      }
      
      .entity-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 8px;
      }
      
      .entity-section {
        background: var(--card-background-color, #fff);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, #ddd);
      }
      
      .entity-section h4 {
        margin: 0 0 12px 0;
        color: var(--primary-color, #03a9f4);
        font-size: 16px;
        font-weight: 500;
      }
      
      .entity-section .required {
        color: var(--error-color, #f44336);
        font-weight: 600;
      }
      
      .entity-section .optional {
        color: var(--secondary-text-color, #666);
        font-size: 12px;
        font-style: italic;
      }
      
      .preview-section {
        background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #0288d1 100%);
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin-top: 16px;
      }
      
      .preview-section h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
      }
      
      .preview-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 14px;
        opacity: 0.9;
      }
      
      .preview-info span {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      @media (max-width: 768px) {
        .entity-grid {
          grid-template-columns: 1fr;
        }
        
        .config-section {
          padding: 12px;
        }
      }
    `;
  }

  connectedCallback() {
    this._render();
    this._setupEventListeners();
  }

  _render() {
    console.log('AC Panel Editor: Rendering with config', this.config);
    if (!this.hass) {
      this.innerHTML = html`<div>Loading...</div>`;
      return;
    }

    const climateEntities = Object.keys(this.hass.states).filter(
      (entity) => entity.startsWith('climate.')
    );
    
    const selectEntities = Object.keys(this.hass.states).filter(
      (entity) => entity.startsWith('select.')
    );

    this.innerHTML = html`
      <style>${AcPanelCardEditor.styles}</style>
      <div class="card-config">
        <div class="config-header">
          <h3>Air Conditioner Panel Configuration</h3>
        </div>

        <div class="config-section">
          <label for="name">Card Name</label>
          <input
            id="name"
            type="text"
            value="${this._name}"
            placeholder="Enter a custom name for your AC panel"
          />
        </div>

        <div class="entity-grid">
          <div class="entity-section">
            <h4>🌡️ Climate Entity <span class="required">*</span></h4>
            <select id="entity">
              <option value="">Select your air conditioner</option>
              ${climateEntities.map((entity) => html`
                <option value="${entity}" ${this._entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Required for temperature and mode control</div>
          </div>

          <div class="entity-section">
            <h4>🌀 Fan Speed Select <span class="optional">(Optional)</span></h4>
            <select id="fan_entity">
              <option value="">Use climate entity fan control</option>
              ${selectEntities.map((entity) => html`
                <option value="${entity}" ${this._fan_entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Separate select entity for fan speed control</div>
          </div>

          <div class="entity-section">
            <h4>🔄 Swing Select <span class="optional">(Optional)</span></h4>
            <select id="swing_entity">
              <option value="">Use climate entity swing control</option>
              ${selectEntities.map((entity) => html`
                <option value="${entity}" ${this._swing_entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Separate select entity for swing control</div>
          </div>

          <div class="entity-section">
            <h4>🌡️ Outside Temperature <span class="optional">(Optional)</span></h4>
            <select id="outside_temp_entity">
              <option value="">No outside temperature</option>
              ${Object.keys(this.hass.states).filter(
                (entity) => entity.startsWith('sensor.') && 
                (entity.includes('temperature') || entity.includes('temp') || entity.includes('weather'))
              ).map((entity) => html`
                <option value="${entity}" ${this._outside_temp_entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Sensor entity for outside temperature display</div>
          </div>

          <div class="entity-section">
            <h4>⚙️ Display Options</h4>
            <div class="config-section">
              <label for="theme">Theme</label>
              <select id="theme">
                <option value="" ${this._theme === '' ? 'selected' : ''}>Default</option>
                <option value="dark" ${this._theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${this._theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="blue" ${this._theme === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="green" ${this._theme === 'green' ? 'selected' : ''}>Green</option>
                <option value="red" ${this._theme === 'red' ? 'selected' : ''}>Red</option>
                <option value="purple" ${this._theme === 'purple' ? 'selected' : ''}>Purple</option>
              </select>
            </div>
            <div class="config-section checkbox">
              <input
                type="checkbox"
                id="hide_temperature"
                ${this._hide_temperature ? 'checked' : ''}
              />
              <label for="hide_temperature">Hide Temperature Control</label>
            </div>
            <div class="config-section checkbox">
              <input
                type="checkbox"
                id="hide_mode"
                ${this._hide_mode ? 'checked' : ''}
              />
              <label for="hide_mode">Hide Mode Selection</label>
            </div>
            <div class="config-section checkbox">
              <input
                type="checkbox"
                id="hide_fan_speed"
                ${this._hide_fan_speed ? 'checked' : ''}
              />
              <label for="hide_fan_speed">Hide Fan Speed Control</label>
            </div>
            <div class="config-section checkbox">
              <input
                type="checkbox"
                id="hide_swing"
                ${this._hide_swing ? 'checked' : ''}
              />
              <label for="hide_swing">Hide Swing Control</label>
            </div>
          </div>

          <div class="entity-section">
            <h4>🌪️ Ceiling Fan Scripts</h4>
            <div class="config-section">
              <label for="fan_script_off">OFF Script</label>
              <input
                id="fan_script_off"
                type="text"
                value="${this._fan_script_off || ''}"
                placeholder="script.ceiling_fan_off"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_1">Speed 1 Script</label>
              <input
                id="fan_script_1"
                type="text"
                value="${this._fan_script_1 || ''}"
                placeholder="script.ceiling_fan_speed_1"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_2">Speed 2 Script</label>
              <input
                id="fan_script_2"
                type="text"
                value="${this._fan_script_2 || ''}"
                placeholder="script.ceiling_fan_speed_2"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_3">Speed 3 Script</label>
              <input
                id="fan_script_3"
                type="text"
                value="${this._fan_script_3 || ''}"
                placeholder="script.ceiling_fan_speed_3"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_4">Speed 4 Script</label>
              <input
                id="fan_script_4"
                type="text"
                value="${this._fan_script_4 || ''}"
                placeholder="script.ceiling_fan_speed_4"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_5">Speed 5 Script</label>
              <input
                id="fan_script_5"
                type="text"
                value="${this._fan_script_5 || ''}"
                placeholder="script.ceiling_fan_speed_5"
              />
            </div>
            <div class="config-section">
              <label for="fan_script_6">Speed 6 Script</label>
              <input
                id="fan_script_6"
                type="text"
                value="${this._fan_script_6 || ''}"
                placeholder="script.ceiling_fan_speed_6"
              />
            </div>
            <div class="optional">Configure scripts to run when ceiling fan buttons are pressed</div>
          </div>
        </div>

        ${this._entity ? html`
          <div class="preview-section">
            <h4>📋 Configuration Preview</h4>
            <div class="preview-info">
              <span>Climate: ${this._entity}</span>
              ${this._fan_entity ? html`<span>Fan: ${this._fan_entity}</span>` : ''}
              ${this._swing_entity ? html`<span>Swing: ${this._swing_entity}</span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _setupEventListeners() {
    // Remove existing listeners to prevent duplicates
    const existingListeners = this.querySelectorAll('[data-listener-attached]');
    existingListeners.forEach(el => {
      el.removeEventListener('change', this._valueChanged);
      el.removeEventListener('input', this._valueChanged);
      el.removeAttribute('data-listener-attached');
    });

    const entitySelect = this.querySelector('#entity');
    const fanEntitySelect = this.querySelector('#fan_entity');
    const swingEntitySelect = this.querySelector('#swing_entity');
    const outsideTempEntitySelect = this.querySelector('#outside_temp_entity');
    const nameInput = this.querySelector('#name');
    const themeSelect = this.querySelector('#theme');
    const fanScriptInputs = this.querySelectorAll('input[id^="fan_script_"]');
    const checkboxes = this.querySelectorAll('input[type="checkbox"]');

    if (entitySelect) {
      entitySelect.addEventListener('change', (e) => this._valueChanged(e));
      entitySelect.setAttribute('data-listener-attached', 'true');
    }
    if (fanEntitySelect) {
      fanEntitySelect.addEventListener('change', (e) => this._valueChanged(e));
      fanEntitySelect.setAttribute('data-listener-attached', 'true');
    }
    if (swingEntitySelect) {
      swingEntitySelect.addEventListener('change', (e) => this._valueChanged(e));
      swingEntitySelect.setAttribute('data-listener-attached', 'true');
    }
    if (outsideTempEntitySelect) {
      outsideTempEntitySelect.addEventListener('change', (e) => this._valueChanged(e));
      outsideTempEntitySelect.setAttribute('data-listener-attached', 'true');
    }
    if (nameInput) {
      nameInput.addEventListener('input', (e) => this._valueChanged(e));
      nameInput.setAttribute('data-listener-attached', 'true');
    }
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => this._valueChanged(e));
      themeSelect.setAttribute('data-listener-attached', 'true');
    }
    fanScriptInputs.forEach(input => {
      input.addEventListener('input', (e) => this._valueChanged(e));
      input.setAttribute('data-listener-attached', 'true');
    });
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this._valueChanged(e));
      checkbox.setAttribute('data-listener-attached', 'true');
    });
  }

  _valueChanged(ev) {
    // Create a completely new config object to avoid "object is not extensible" error
    const newConfig = JSON.parse(JSON.stringify(this.config || {}));

    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (target.id === 'entity') {
      newConfig.entity = value;
    } else if (target.id === 'fan_entity') {
      newConfig.fan_entity = value;
    } else if (target.id === 'swing_entity') {
      newConfig.swing_entity = value;
    } else if (target.id === 'outside_temp_entity') {
      newConfig.outside_temp_entity = value;
    } else if (target.id === 'name') {
      newConfig.name = value;
    } else if (target.id === 'theme') {
      newConfig.theme = value;
    } else if (target.id.startsWith('fan_script_')) {
      // Handle fan script inputs
      if (!newConfig.ceiling_fan_scripts) {
        newConfig.ceiling_fan_scripts = {};
      }
      const scriptKey = target.id.replace('fan_script_', '');
      if (scriptKey === 'off') {
        newConfig.ceiling_fan_scripts.off = value;
      } else {
        newConfig.ceiling_fan_scripts[`speed${scriptKey}`] = value;
      }
    } else if (target.type === 'checkbox') {
      newConfig[target.id] = target.checked;
    }

    // Update the config property
    this.config = newConfig;

    // Debug logging
    console.log('AC Panel Editor: Configuration changed', this.config);

    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// Register all components
customElements.define('ac-panel', AcPanel);
customElements.define('ac-panel-card', AcPanelCard);
customElements.define('ac-panel-card-editor', AcPanelCardEditor);

// Register with Lovelace
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ac-panel-card',
  name: 'Air Conditioner Panel',
  description: 'A custom card for controlling air conditioners with fan speeds, swing positions, and modes'
});