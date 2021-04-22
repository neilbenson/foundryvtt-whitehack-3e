import { attackRoll } from './helpers/diceHelpers.js';

class WHItem extends Item {
  chatTemplate = {
    "Gear": "systems/wh3e/templates/chat/item-info.hbs",
    "Ability": "systems/wh3e/templates/chat/item-info.hbs",
    "Armour": "systems/wh3e/templates/chat/armour-info.hbs"
  };

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
    return ChatMessage.create(messageData);
  };

  weaponAttack(weapon, toHitMod, damageMod, rollType) {
    attackRoll(weapon, this.actor, toHitMod, damageMod, rollType);
  };

};

export default WHItem;