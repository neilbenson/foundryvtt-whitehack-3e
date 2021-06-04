import * as c from "./constants.js";

class WHItem extends Item {
  chatTemplate = {
    [c.GEAR]: "systems/whitehack3e/templates/chat/item-info.hbs",
    [c.ABILITY]: "systems/whitehack3e/templates/chat/item-info.hbs",
    [c.ARMOUR]: "systems/whitehack3e/templates/chat/armour-info.hbs",
  };

  /**
   * Set default token for items
   */
  prepareData() {
    super.prepareData();

    if (!this.data.img || this.data.img == c.ITEMBAG) {
      const abilityTypeIcons = {
        [c.ABILITY]: [c.DEFAULTABILITYIMAGE],
        [c.ARMOUR]: [c.DEFAULTARMOURIMAGE],
        [c.GEAR]: [c.DEFAULTGEARIMAGE],
        [c.WEAPON]: [c.DEFAULTWEAPONIMAGE],
      };
      this.data.img = abilityTypeIcons[this.data.type][0];
    }
  }

  /**
   * Send item info to chat
   */
  async sendInfoToChat() {
    let messageData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id,
    };
    messageData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
    messageData.roll = true;
    ChatMessage.create(messageData);
  }
}

export default WHItem;
