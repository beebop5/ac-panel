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

      .ac-card {
        background: var(--ac-background-color);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        font-family: 'Roboto', sans-serif;
        color: var(--ac-text-color);
        max-width: 400px;
        margin: 0 auto;
      }

      .ac-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--ac-border-color);
      }

      .ac-title {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }

      .ac-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ac-status-indicator {
        width: 12px;
        height: 12px;
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
        gap: 20px;
      }

      .ac-temperature {
        text-align: center;
        margin-bottom: 20px;
      }

      .ac-temp-display {
        font-size: 48px;
        font-weight: 300;
        color: var(--ac-primary-color);
        margin: 0;
        line-height: 1;
      }

      .ac-temp-unit {
        font-size: 16px;
        color: var(--ac-text-color);
        opacity: 0.7;
      }

      .ac-temp-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-top: 15px;
      }

      .ac-temp-btn {
        width: 40px;
        height: 40px;
        border: 2px solid var(--ac-primary-color);
        background: transparent;
        border-radius: 50%;
        color: var(--ac-primary-color);
        font-size: 20px;
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
        font-size: 14px;
        font-weight: 500;
        margin: 0 0 10px 0;
        color: var(--ac-text-color);
        opacity: 0.8;
      }

      .ac-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ac-option {
        padding: 8px 16px;
        border: 1px solid var(--ac-border-color);
        background: white;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
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
        padding: 15px;
        background: var(--ac-primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 20px;
      }

      .ac-power-btn:hover {
        background: #0288d1;
        transform: translateY(-1px);
      }

      .ac-power-btn.off {
        background: #666;
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
    this._currentMode = state.attributes.hvac_mode || 'cool';
    
    // Check for separate fan entity
    if (this.fan_entity && this.hass.states[this.fan_entity]) {
      const fanState = this.hass.states[this.fan_entity];
      this._currentFanSpeed = fanState.state || fanState.attributes.fan_mode || 'auto';
    } else {
      this._currentFanSpeed = state.attributes.fan_mode || 'auto';
    }
    
    // Check for separate swing entity
    if (this.swing_entity && this.hass.states[this.swing_entity]) {
      const swingState = this.hass.states[this.swing_entity];
      this._currentSwing = swingState.state || swingState.attributes.swing_mode || 'off';
    } else {
      this._currentSwing = state.attributes.swing_mode || 'off';
    }
  }

  _callService(service, data = {}) {
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
    if (this.fan_entity) {
      // Use separate fan entity
      this.hass.callService('fan', 'set_speed', {
        entity_id: this.fan_entity,
        speed: speed
      });
    } else {
      // Use climate entity
      this._callService('set_fan_mode', { fan_mode: speed });
    }
  }

  _setSwing(swing) {
    if (this.swing_entity) {
      // Use separate swing entity
      this.hass.callService('fan', 'set_direction', {
        entity_id: this.swing_entity,
        direction: swing
      });
    } else {
      // Use climate entity
      this._callService('set_swing_mode', { swing_mode: swing });
    }
  }

  _render() {
    const defaultModes = ['cool', 'heat', 'fan_only', 'auto', 'dry'];
    const defaultFanSpeeds = ['auto', 'low', 'medium', 'high'];
    const defaultSwingModes = ['off', 'horizontal', 'vertical', 'both'];

    const modes = this.modes || defaultModes;
    const fanSpeeds = this.fan_speeds || defaultFanSpeeds;
    const swingModes = this.swing_modes || defaultSwingModes;

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
    this.config = config || {};
    // Don't throw error here - let the render method handle missing entity
  }

  getCardSize() {
    return 3;
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
          hass="${this.hass}"
          entity="${this.config.entity}"
          fan_entity="${this.config.fan_entity || ''}"
          swing_entity="${this.config.swing_entity || ''}"
          name="${this.config.name || ''}"
          theme="${this.config.theme || ''}"
          hide_temperature="${this.config.hide_temperature || false}"
          hide_mode="${this.config.hide_mode || false}"
          hide_fan_speed="${this.config.hide_fan_speed || false}"
          hide_swing="${this.config.hide_swing || false}"
        ></ac-panel>
      </ha-card>
    `;
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
    this.config = config || {};
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
    if (!this.hass) {
      this.innerHTML = html`<div>Loading...</div>`;
      return;
    }

    const climateEntities = Object.keys(this.hass.states).filter(
      (entity) => entity.startsWith('climate.')
    );
    
    const fanEntities = Object.keys(this.hass.states).filter(
      (entity) => entity.startsWith('fan.')
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
            <h4>🌀 Fan Entity <span class="optional">(Optional)</span></h4>
            <select id="fan_entity">
              <option value="">Use climate entity fan control</option>
              ${fanEntities.map((entity) => html`
                <option value="${entity}" ${this._fan_entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Separate fan entity for advanced control</div>
          </div>

          <div class="entity-section">
            <h4>🔄 Swing Entity <span class="optional">(Optional)</span></h4>
            <select id="swing_entity">
              <option value="">Use climate entity swing control</option>
              ${fanEntities.map((entity) => html`
                <option value="${entity}" ${this._swing_entity === entity ? 'selected' : ''}>${entity}</option>
              `)}
            </select>
            <div class="optional">Separate swing entity for directional control</div>
          </div>

          <div class="entity-section">
            <h4>⚙️ Display Options</h4>
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
    const entitySelect = this.querySelector('#entity');
    const fanEntitySelect = this.querySelector('#fan_entity');
    const swingEntitySelect = this.querySelector('#swing_entity');
    const nameInput = this.querySelector('#name');
    const checkboxes = this.querySelectorAll('input[type="checkbox"]');

    if (entitySelect) {
      entitySelect.addEventListener('change', (e) => this._valueChanged(e));
    }
    if (fanEntitySelect) {
      fanEntitySelect.addEventListener('change', (e) => this._valueChanged(e));
    }
    if (swingEntitySelect) {
      swingEntitySelect.addEventListener('change', (e) => this._valueChanged(e));
    }
    if (nameInput) {
      nameInput.addEventListener('input', (e) => this._valueChanged(e));
    }
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this._valueChanged(e));
    });
  }

  _valueChanged(ev) {
    if (!this.config) {
      this.config = {};
    }

    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (target.id === 'entity') {
      this.config.entity = value;
    } else if (target.id === 'fan_entity') {
      this.config.fan_entity = value;
    } else if (target.id === 'swing_entity') {
      this.config.swing_entity = value;
    } else if (target.id === 'name') {
      this.config.name = value;
    } else if (target.type === 'checkbox') {
      if (target.checked) {
        this.config[target.id] = true;
      } else {
        delete this.config[target.id];
      }
    }

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