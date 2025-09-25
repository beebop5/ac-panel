import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

@customElement('ac-panel-card')
export class AcPanelCard extends LitElement {
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

    this.entity = config.entity;
    this.name = config.name;
    this.theme = config.theme;
    this.hide_temperature = config.hide_temperature || false;
    this.hide_mode = config.hide_mode || false;
    this.hide_fan_speed = config.hide_fan_speed || false;
    this.hide_swing = config.hide_swing || false;
    this.modes = config.modes;
    this.fan_speeds = config.fan_speeds;
    this.swing_modes = config.swing_modes;
  }

  getCardSize() {
    return 3;
  }

  render() {
    if (!this.hass || !this.entity) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${this.entity}</div>
        </ha-card>
      `;
    }

    const state = this.hass.states[this.entity];
    if (!state) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${this.entity}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <ac-panel
          .hass=${this.hass}
          .entity=${this.entity}
          .name=${this.name}
          .theme=${this.theme}
          .hide_temperature=${this.hide_temperature}
          .hide_mode=${this.hide_mode}
          .hide_fan_speed=${this.hide_fan_speed}
          .hide_swing=${this.hide_swing}
          .modes=${this.modes}
          .fan_speeds=${this.fan_speeds}
          .swing_modes=${this.swing_modes}
        ></ac-panel>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement('ac-panel-card-editor');
  }
}

@customElement('ac-panel-card-editor')
export class AcPanelCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) private _config?: any;

  setConfig(config) {
    this._config = config;
  }

  get _entity() {
    return this._config?.entity || '';
  }

  get _name() {
    return this._config?.name || '';
  }

  get _hide_temperature() {
    return this._config?.hide_temperature || false;
  }

  get _hide_mode() {
    return this._config?.hide_mode || false;
  }

  get _hide_fan_speed() {
    return this._config?.hide_fan_speed || false;
  }

  get _hide_swing() {
    return this._config?.hide_swing || false;
  }

  get _modes() {
    return this._config?.modes || [];
  }

  get _fan_speeds() {
    return this._config?.fan_speeds || [];
  }

  get _swing_modes() {
    return this._config?.swing_modes || [];
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
    if (!this._config) {
      this._config = {};
    }

    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (target.id === 'entity') {
      this._config.entity = value;
    } else if (target.id === 'name') {
      this._config.name = value;
    } else if (target.type === 'checkbox') {
      if (target.checked) {
        this._config[target.id] = true;
      } else {
        delete this._config[target.id];
      }
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ac-panel-card': AcPanelCard;
    'ac-panel-card-editor': AcPanelCardEditor;
  }
}
