// Air Conditioner Panel for Home Assistant
// Custom Lovelace card for controlling air conditioners

const LitElement = customElements.get('home-assistant')?.__proto__?.constructor || Object.getPrototypeOf(customElements.get('home-assistant'));
const html = LitElement?.html || (() => '');
const css = LitElement?.css || (() => '');

// Main AC Panel Component
class AcPanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      entity: { type: String },
      name: { type: String },
      theme: { type: String },
      hide_temperature: { type: Boolean },
      hide_mode: { type: Boolean },
      hide_fan_speed: { type: Boolean },
      hide_swing: { type: Boolean },
      modes: { type: Array },
      fan_speeds: { type: Array },
      swing_modes: { type: Array },
      _temperature: { type: Number, state: true },
      _currentMode: { type: String, state: true },
      _currentFanSpeed: { type: String, state: true },
      _currentSwing: { type: String, state: true },
      _isOn: { type: Boolean, state: true }
    };
  }

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
    super.connectedCallback();
    this._updateState();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('entity')) {
      this._updateState();
    }
  }

  _updateState() {
    if (!this.hass || !this.entity) return;

    const state = this.hass.states[this.entity];
    if (!state) return;

    this._isOn = state.state === 'on';
    this._temperature = state.attributes.temperature || 22;
    this._currentMode = state.attributes.hvac_mode || 'cool';
    this._currentFanSpeed = state.attributes.fan_mode || 'auto';
    this._currentSwing = state.attributes.swing_mode || 'off';
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
    this._callService('set_fan_mode', { fan_mode: speed });
  }

  _setSwing(swing) {
    this._callService('set_swing_mode', { swing_mode: swing });
  }

  render() {
    const defaultModes = ['cool', 'heat', 'fan_only', 'auto', 'dry'];
    const defaultFanSpeeds = ['auto', 'low', 'medium', 'high'];
    const defaultSwingModes = ['off', 'horizontal', 'vertical', 'both'];

    const modes = this.modes || defaultModes;
    const fanSpeeds = this.fan_speeds || defaultFanSpeeds;
    const swingModes = this.swing_modes || defaultSwingModes;

    return html`
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
                  class="ac-temp-btn" 
                  @click=${() => this._setTemperature(this._temperature - 1)}
                  ?disabled=${!this._isOn}
                >
                  −
                </button>
                <button 
                  class="ac-temp-btn" 
                  @click=${() => this._setTemperature(this._temperature + 1)}
                  ?disabled=${!this._isOn}
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
                    class="ac-option ${this._currentMode === mode ? 'active' : ''}"
                    @click=${() => this._setMode(mode)}
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
                    class="ac-option ${this._currentFanSpeed === speed ? 'active' : ''}"
                    @click=${() => this._setFanSpeed(speed)}
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
                    class="ac-option ${this._currentSwing === swing ? 'active' : ''}"
                    @click=${() => this._setSwing(swing)}
                  >
                    ${swing.toUpperCase()}
                  </div>
                `)}
              </div>
            </div>
          ` : ''}

          <button 
            class="ac-power-btn ${this._isOn ? '' : 'off'}"
            @click=${this._togglePower}
          >
            ${this._isOn ? 'TURN OFF' : 'TURN ON'}
          </button>
        </div>
      </div>
    `;
  }
}

// Lovelace Card Wrapper - This is what appears in the dashboard
class AcPanelCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

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
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  render() {
    if (!this.hass || !this.config.entity) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${this.config.entity}</div>
        </ha-card>
      `;
    }

    const state = this.hass.states[this.config.entity];
    if (!state) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${this.config.entity}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <ac-panel
          .hass=${this.hass}
          .entity=${this.config.entity}
          .name=${this.config.name}
          .theme=${this.config.theme}
          .hide_temperature=${this.config.hide_temperature}
          .hide_mode=${this.config.hide_mode}
          .hide_fan_speed=${this.config.hide_fan_speed}
          .hide_swing=${this.config.hide_swing}
          .modes=${this.config.modes}
          .fan_speeds=${this.config.fan_speeds}
          .swing_modes=${this.config.swing_modes}
        ></ac-panel>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement('ac-panel-card-editor');
  }
}

// Card Editor for Lovelace UI
class AcPanelCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    this.config = config || {};
  }

  get _entity() {
    return this.config?.entity || '';
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
        gap: 16px;
      }
      
      .config-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .config-section label {
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .config-section input,
      .config-section select {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }
      
      .config-section checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `;
  }

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    const entities = Object.keys(this.hass.states).filter(
      (entity) => entity.startsWith('climate.')
    );

    return html`
      <div class="card-config">
        <div class="config-section">
          <label for="entity">Entity:</label>
          <select id="entity" .value=${this._entity} @change=${this._valueChanged}>
            <option value="">Select an entity</option>
            ${entities.map((entity) => html`
              <option value=${entity}>${entity}</option>
            `)}
          </select>
        </div>

        <div class="config-section">
          <label for="name">Name (optional):</label>
          <input
            id="name"
            type="text"
            .value=${this._name}
            @input=${this._valueChanged}
            placeholder="Custom name for the card"
          />
        </div>

        <div class="config-section">
          <label>
            <input
              type="checkbox"
              .checked=${this._hide_temperature}
              @change=${this._valueChanged}
            />
            Hide Temperature Control
          </label>
        </div>

        <div class="config-section">
          <label>
            <input
              type="checkbox"
              .checked=${this._hide_mode}
              @change=${this._valueChanged}
            />
            Hide Mode Selection
          </label>
        </div>

        <div class="config-section">
          <label>
            <input
              type="checkbox"
              .checked=${this._hide_fan_speed}
              @change=${this._valueChanged}
            />
            Hide Fan Speed Control
          </label>
        </div>

        <div class="config-section">
          <label>
            <input
              type="checkbox"
              .checked=${this._hide_swing}
              @change=${this._valueChanged}
            />
            Hide Swing Control
          </label>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this.config) {
      this.config = {};
    }

    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (target.id === 'entity') {
      this.config.entity = value;
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