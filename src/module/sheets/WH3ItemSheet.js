import { updateActorEncumbrance, updateActorGroups } from "../helpers/itemHelpers.js";
import * as c from "../constants.js";

export default class WH3ItemSheet extends ItemSheet {
  static get defaultOptions() {
    let sheetClasses = ["wh3e", "sheet", "item"];
    const sheetBackground = (game.settings.get("whitehack3e", "background")) || c.WHBACKGROUND;
    sheetClasses.push(sheetBackground);
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 350,
      classes: sheetClasses,
      resizable: false,
    });
  }

  get template() {
    return `systems/whitehack3e/templates/sheets/${this.item.data.type.toLowerCase()}-sheet.hbs`;
  }

  /**
   * Fetch Foundry data
   * @returns {Object}
   */
  getData(options) {
    const baseData = super.getData(options);
    const sheetData = {
      ...baseData.item.data,
      editable: true,
      config: CONFIG.wh3e,
    };
    return sheetData;
  }

  /**
   * Register event listeners
   * @param {Object} html
   */
  activateListeners(html) {
    if (this.isEditable) {
      html.find(".gear-quantity-input").change(this._actorGearUpdateHandler.bind(this));
      html.find(".ability-type-select select").change(this._actorAbilityTypeUpdateHandler.bind(this));
      html.find(".item-name").change(this._actorAbilityNameUpdateHandler.bind(this));
    }

    super.activateListeners(html);
  }

  /**
   * Update actor ability type for selected item
   * @param {Object} event
   */
  async _actorAbilityTypeUpdateHandler(event) {
    if (this.actor) {
      await this.actor.updateEmbeddedDocuments("Item", [
        {
          _id: this.item.id,
          data: {
            type: event.currentTarget.value,
          },
        },
      ]);
      await updateActorEncumbrance(this.actor);
      await updateActorGroups(this.actor);
    }
  }

  /**
   * Update actor ability name for selected item
   * @param {Object} event
   */
  async _actorAbilityNameUpdateHandler(event) {
    if (this.actor) {
      await this.actor.updateEmbeddedDocuments("Item", [
        {
          _id: this.item.id,
          name: event.currentTarget.value,
        },
      ]);
      await updateActorGroups(this.actor);
    }
  }

  /**
   * Update actor gear for selected item
   * @param {Object} event
   */
  async _actorGearUpdateHandler(event) {
    if (this.actor) {
      await this.actor.updateEmbeddedDocuments("Item", [
        {
          _id: this.item.id,
          data: {
            quantity: +event.currentTarget.value,
          },
        },
      ]);
      updateActorEncumbrance(this.actor);
    }
  }
}
