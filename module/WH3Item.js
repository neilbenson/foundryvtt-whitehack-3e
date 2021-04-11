class WHItem extends Item {
  chatTemplate = {
    "Weapon": "systems/wh3e/templates/chat/attack-roll.hbs",
    "Gear": "systems/wh3e/templates/chat/item-info.hbs",
    "Ability": "systems/wh3e/templates/chat/item-info.hbs",
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

  async weaponAttack(weapon, toHitMod = 0, damageMod = 0, rollType = 'roll') {
    let strMod = 0;
    let strDmgMod = 0;
    if (this.actor.data.data.basics.class === 'theStrong') {
      strMod = this.actor.data.data.attributes.str.mod;
      strDmgMod = this.actor.data.data.attributes.str.dmgMod;
    }

    const rollData = {
      strMod: strMod,
      strDmgMod: strDmgMod,
      damageMod: damageMod
    };

    const messageData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };

    const attackValue = this.actor.data.data.combat.attackValue;
    const rollTemplate = "systems/wh3e/templates/chat/attack-roll.hbs";

    // To Hit Roll
    let rollFormula = this.getAttackDice(rollType);
    const toHitRoll = new Roll(rollFormula, rollData).evaluate();
    cardData.toHitTemplate = await toHitRoll.render();
    const toHitResult = toHitRoll.toMessage(messageData, { rollMode: null, create: false });
    cardData.toHitResult = toHitResult.roll.total;
    cardData.toHitTarget = attackValue + strMod + toHitMod;
    cardData.weapon = weapon.name;

    if (game.dice3d) {
      await game.dice3d.showForRoll(toHitResult.roll, game.user, true, null, false);
    }

    if (toHitResult.roll.total <= cardData.toHitTarget) {
      // Hit - Damage Roll
      rollFormula = "(" + game.i18n.localize("wh3e.damageDice." + weapon.data.data.damage) + ")" + " + @strDmgMod + @damageMod";
      const damageRoll = new Roll(rollFormula, rollData).evaluate();
      cardData.damageTemplate = await damageRoll.render();
      const damageResult = damageRoll.toMessage(messageData, { rollMode: null, create: false });

      if (game.dice3d) {
        await game.dice3d.showForRoll(damageResult.roll, game.user, true, null, false);
      }

      cardData = {
        ...cardData,
        damageResult: damageResult.roll.total,
        attackHit: true,
        acSuccess: " hits AC " + toHitResult.roll.total,
      }
    } else {
      // Miss - hide damage template in message
      cardData.attackHit = false;
      cardData.acSuccess = " misses";
    }

    messageData.content = await renderTemplate(rollTemplate, cardData);
    messageData.roll = true;
    return ChatMessage.create(messageData);
  };

  getAttackDice(rollType) {
    switch (rollType) {
      case 'doublePositive':
        return '2d20kl';
      case 'doubleNegative':
        return '2d20kh';
      default:
        return '1d20';
    }
  };

};



export default WHItem;