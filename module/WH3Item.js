class WHItem extends Item {
  chatTemplate = {
    "Weapon": "systems/wh3e/templates/partials/attack-roll.hbs",
    "Gear": "systems/wh3e/templates/partials/item-info.hbs",
    "Ability": "systems/wh3e/templates/partials/item-info.hbs",
  }

  async roll() {
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };
    chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
    chatData.roll = true;
    return ChatMessage.create(chatData);
  }
};

export default WHItem;