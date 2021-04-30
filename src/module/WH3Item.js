import * as c from './constants.js';

class WHItem extends Item {
  chatTemplate = {
    [c.GEAR]: "systems/whitehack3e/templates/chat/item-info.hbs",
    [c.ABILITY]: "systems/whitehack3e/templates/chat/item-info.hbs",
    [c.ARMOUR]: "systems/whitehack3e/templates/chat/armour-info.hbs"
  };

  /**
   * Set default token for items
   */
  prepareData() {
    if (!this.data.img) { this.data.img = c.DEFAULTITEMIMAGE }

    super.prepareData();
  }

  /**
   * Send item info to chat
   */
  async sendInfoToChat() {
    let messageData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };
    messageData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
    messageData.roll = true;
    ChatMessage.create(messageData);
  };

};

export default WHItem;