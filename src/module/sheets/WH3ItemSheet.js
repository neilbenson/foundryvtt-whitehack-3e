import { updateActorEncumbrance } from '../helpers/itemHelpers.js';

export default class WH3ItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 350,
      classes: ["wh3e", "sheet", "item"],
      resizable: false
    })
  };

  get template() {
    return `systems/wh3e/templates/sheets/${this.item.data.type}-sheet.hbs`;
  };

  /**
   * Fetch Foundry data
   * @returns {Object}
   */
  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    return data;
  };

  /**
   * Register event listeners
   * @param {Object} html
   */
  activateListeners(html) {
    if (this.isEditable) {
      html.find(".gear-quantity-input").change(this._actorGearUpdateHandler.bind(this));
      html.find(".ability-type-select select").change(this._actorAbilityUpdateHandler.bind(this));
    }

    super.activateListeners(html);
  };

  /**
   * Update actor ability for selected item
   * @param {Object} event
   */
  async _actorAbilityUpdateHandler(event) {
    if (this.actor) {
      await this.actor.updateOwnedItem({
        _id: this.item.id,
        data: {
          type: event.currentTarget.value
        }
      })
      updateActorEncumbrance(this.actor);
    }
  }

  /**
   * Update actor gear for selected item
   * @param {Object} event
   */
  async _actorGearUpdateHandler(event) {
    if (this.actor) {
      await this.actor.updateOwnedItem({
        _id: this.item.id,
        data: {
          quantity: +event.currentTarget.value
        }
      })
      updateActorEncumbrance(this.actor);
    }
  }
}