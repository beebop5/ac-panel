import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

@customElement('ac-panel')
export class AcPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: String }) public entity!: string;
  @property({ type: String }) public name?: string;
  @property({ type: String }) public theme?: string;
  @property({ type: Boolean }) public hide_temperature = false;
  @property({ type: Boolean }) public hide_mode = false;
  @property({ type: Boolean }) public hide_fan_speed = false;
  @property({ type: Boolean }) public hide_swing = false;
  @property({ type: Array }) public modes?: string[];
  @property({ type: Array }) public fan_speeds?: string[];
  @property({ type: Array }) public swing_modes?: string[];

  @state() private _temperature = 22;
  @state() private _currentMode = 'cool';
  @state() private _currentFanSpeed = 'auto';
  @state() private _currentSwing = 'off';
  @state() private _isOn = false;

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

  private _updateState() {
    if (!this.hass || !this.entity) return;

    const state = this.hass.states[this.entity];
    if (!state) return;

    this._isOn = state.state === 'on';
    this._temperature = state.attributes.temperature || 22;
    this._currentMode = state.attributes.hvac_mode || 'cool';
    this._currentFanSpeed = state.attributes.fan_mode || 'auto';
    this._currentSwing = state.attributes.swing_mode || 'off';
  }

  private _callService(service, data = {}) {
    this.hass.callService('climate', service, {
      entity_id: this.entity,
      ...data
    });
  }

  private _togglePower() {
    this._callService(this._isOn ? 'turn_off' : 'turn_on');
  }

  private _setTemperature(temp) {
    this._callService('set_temperature', { temperature: temp });
  }

  private _setMode(mode) {
    this._callService('set_hvac_mode', { hvac_mode: mode });
  }

  private _setFanSpeed(speed) {
    this._callService('set_fan_mode', { fan_mode: speed });
  }

  private _setSwing(swing) {
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

declare global {
  interface HTMLElementTagNameMap {
    'ac-panel': AcPanel;
  }
}
