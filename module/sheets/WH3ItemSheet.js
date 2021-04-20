import { updateActorForItems } from '../equipmentHelpers.js';

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

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    return data;
  };

  activateListeners(html) {
    if (this.isEditable) {
      html.find(".gear-quantity-input").change(this._onUpdateGearQuantity.bind(this));
      html.find(".ability-type-select select").change(this._onUpdateActorForItems.bind(this));
    }

    super.activateListeners(html);
  };

  async _onUpdateActorForItems(event) {
    if (this.actor) {
      await this.actor.updateOwnedItem({
        _id: this.item.id,
        data: {
          type: event.currentTarget.value
        }
      })
      updateActorForItems(this.actor);
    }
  }

  async _onUpdateGearQuantity(event) {
    if (this.actor) {
      await this.actor.updateOwnedItem({
        _id: this.item.id,
        data: {
          quantity: +event.currentTarget.value
        }
      })
      updateActorForItems(this.actor);
    }
  }
}