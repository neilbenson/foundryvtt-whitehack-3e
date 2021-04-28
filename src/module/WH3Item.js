import * as c from './constants.js';

class WHItem extends Item {
  chatTemplate = {
    [c.GEAR]: "systems/wh3e/templates/chat/item-info.hbs",
    [c.ABILITY]: "systems/wh3e/templates/chat/item-info.hbs",
    [c.ARMOUR]: "systems/wh3e/templates/chat/armour-info.hbs"
  };

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