class WHItem extends Item {
  chatTemplate = {
    "Weapon": "systems/wh3e/templates/chat/attack-roll.hbs",
    "Gear": "systems/wh3e/templates/chat/item-info.hbs",
    "Ability": "systems/wh3e/templates/chat/item-info.hbs",
  }

  async sendInfoToChat() {
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

  async rollWeaponAttack(weapon) {
    // Not ideal, I've not been able to show both attack and damage results in one message
    const rollData = {
      strMod: this.actor.data.data.attributes.str.mod
    };
    const messageData = {
      speaker: ChatMessage.getSpeaker()
    };

    const rollTemplate = "systems/wh3e/templates/chat/attack-roll.hbs";
    const damageTemplate = "systems/wh3e/templates/chat/attack-damage.hbs";

    // Attack Result
    let rollFormula = "1d20 + @strMod";
    const toHitResult = new Roll(rollFormula, rollData).evaluate();
    messageData.content = await toHitResult.render({ template: rollTemplate });
    messageData.flavor = this.actor.name + " makes an " + weapon.name + " attack and rolls " + toHitResult.total;
    toHitResult.toMessage(messageData);

    // Damage Result
    rollFormula = game.i18n.localize("wh3e.damageDice." + weapon.data.data.damage) + " + @strMod";
    const damageResult = new Roll(rollFormula, rollData).evaluate();
    messageData.content = await damageResult.render({ template: damageTemplate });
    messageData.flavor = this.actor.name + " does " + damageResult.total + " damage with " + weapon.name;
    damageResult.toMessage(messageData);

  }
};

export default WHItem;