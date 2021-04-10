class WHItem extends Item {
  chatTemplate = {
    "Weapon": "systems/wh3e/templates/chat/attack-roll.hbs",
    "Gear": "systems/wh3e/templates/chat/item-info.hbs",
    "Ability": "systems/wh3e/templates/chat/item-info.hbs",
  }

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
  }

  async rollWeaponAttack(weapon) {
    // Not ideal, I've not been able to show both attack and damage results in one message
    const rollData = {
      strMod: this.actor.data.data.attributes.str.mod
    };
    const messageData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };

    const rollTemplate = "systems/wh3e/templates/chat/attack-roll.hbs";

    // To Hit Roll
    let rollFormula = "1d20 + @strMod";
    const toHitRoll = new Roll(rollFormula, rollData).evaluate();
    const attackContent = await toHitRoll.render();
    const toHitResult = toHitRoll.toMessage(messageData, { rollMode: null, create: false });

    // Damage Roll
    rollFormula = game.i18n.localize("wh3e.damageDice." + weapon.data.data.damage) + " + @strMod";
    const damageRoll = new Roll(rollFormula, rollData).evaluate();
    const damageContent = await damageRoll.render();
    const damageResult = damageRoll.toMessage(messageData, { rollMode: null, create: false });

    if (game.dice3d) {
      await game.dice3d.showForRoll(toHitResult.roll, game.user, true, null, false);
      await game.dice3d.showForRoll(damageResult.roll, game.user, true, null, false);
    }

    cardData.toHitTemplate = attackContent;
    cardData.damageTemplate = damageContent;
    cardData.toHitResult = toHitResult.roll.total;
    cardData.damageResult = damageResult.roll.total;
    messageData.content = await renderTemplate(rollTemplate, cardData);
    messageData.flavor = this.actor.name + " attacks with " + weapon.name;
    messageData.roll = true;
    return ChatMessage.create(messageData);
  }
};

export default WHItem;