export const getResultColour = (rollResult, rollTarget) => {
  if (rollResult <= rollTarget) {
    return 'green';
  } else {
    return 'red';
  }
};

export const rollModDialog = (actor, rollAttribute, rollTitle) => {
  const rollModLabel = game.i18n.localize("wh3e.modifiers.rollMod");
  const content = `
  <div class="dialog mod-prompt flex-group-center">
    <div class="form-group">
      <label for="roll_modifier">${rollModLabel}</label>
      <input type="number" id="roll_modifier" name="roll_modifier" value="0"/>
    </div>
  </div>`;

  new Dialog({
    title: rollTitle,
    content: content,
    default: "roll",
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: null,
        default: true,
        callback: (html) => taskRollDialogCallback(html, actor, rollAttribute)
      },
      doublePositiveRoll: {
        icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
        label: null,
        default: true,
        callback: (html) => taskRollDialogCallback(html, actor, rollAttribute, 'doublePositive')
      },
      doubleNegativeRoll: {
        icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
        label: null,
        default: true,
        callback: (html) => taskRollDialogCallback(html, actor, rollAttribute, 'doubleNegative')
      },
    },
  }, { width: 50 }).render(true);
};

export const attackModDialog = (item) => {
  const toHitModLabel = game.i18n.localize("wh3e.modifiers.toHitMod");
  const damageModLabel = game.i18n.localize("wh3e.modifiers.damageMod");
  const content = `
  <div class="dialog mod-prompt grid grid-2col flex-group-center">
    <div class="form-group">
      <label for="attack_modifier">${toHitModLabel}</label>
      <input type="number" id="attack_modifier" name="attack_modifier" value="0"/>
    </div>
    <div class="form-group">
      <label for="damage_modifier">${damageModLabel}</label>
      <input type="number" id="damage_modifier" name="damage_modifier" value="0"/>
    </div>
  </div>`;

  new Dialog({
    title: item.name + " Attack",
    content: content,
    default: "roll",
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: null,
        default: true,
        callback: (html) => attackRollDialogCallback(html, item)
      },
      doublePositiveRoll: {
        icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
        label: null,
        default: true,
        callback: (html) => attackRollDialogCallback(html, item, 'doublePositive')
      },
      doubleNegativeRoll: {
        icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
        label: null,
        default: true,
        callback: (html) => attackRollDialogCallback(html, item, 'doubleNegative')
      },
    },
  }, { width: 50 }).render(true);
};

export const attackRoll = async (weapon, actor, toHitMod = 0, damageMod = 0, rollType = 'roll') => {
  let strMod = 0;
  let strDmgMod = 0;
  if (actor.data.type !== 'Monster' && actor.data.data.basics.class === 'theStrong') {
    strMod = actor.data.data.attributes.str.mod;
    strDmgMod = actor.data.data.attributes.str.dmgMod;
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
    ...weapon.data,
    owner: actor.id
  };

  const attackValue = actor.data.data.combat.attackValue;
  const rollTemplate = "systems/wh3e/templates/chat/attack-roll.hbs";

  // To Hit Roll
  let rollFormula = getDiceToRoll(rollType);
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

const getDiceToRoll = (rollType) => {
  switch (rollType) {
    case 'doublePositive':
      return '2d20kl';
    case 'doubleNegative':
      return '2d20kh';
    default:
      return '1d20';
  }
};

const taskRoll = async (actor, rollMod, rollFor, rollType) => {
  const rollData = {
    rollMod: rollMod
  };

  const messageData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker()
  };

  let cardData = {
    ...actor,
    owner: actor.data.id
  };

  let rollValue = 0;
  if (rollFor === 'savingThrow') {
    rollValue = actor.data.data.savingThrow;
  } else {
    rollValue = actor.data.data.attributes[rollFor].value;
  }
  const rollTarget = rollValue + rollMod;
  const rollTemplate = "systems/wh3e/templates/chat/task-roll.hbs";

  // Task Roll
  const roll = new Roll(getDiceToRoll(rollType), rollData).evaluate();
  cardData.rollTemplate = await roll.render();
  roll.toMessage(messageData, { rollMode: null, create: false });

  // Get results data
  const diceOne = roll.terms[0].results[0].result;
  const diceTwo = roll.terms[0].results.length > 1 ? roll.terms[0].results[1].result : null;
  const highestResult = diceOne >= diceTwo ? diceOne : diceTwo;
  const lowestResult = diceOne < diceTwo ? diceOne : diceTwo;

  let rollResult = diceOne;
  let formula = roll.formula;


  // Put this into dicehelper
  // Add strings to language file
  switch (rollType) {
    case "doublePositive":
      formula = "2d20 take best result";
      break;
    case "doubleNegative":
      formula = "2d20 take worst result";
      break;
  }

  // If double positive roll keep the highest under rollTarget
  // If double negative keep just the highest
  if (rollType === "doublePositive") {
    formula = "2d20 take best result";
    rollResult = highestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = lowestResult;
    }
  } else if (rollType === "doubleNegative") {
    formula = "2d20 take worst result";
    rollResult = lowestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = highestResult;
    }
  }

  cardData = {
    ...cardData,
    diceOne: diceOne,
    diceTwo: diceTwo,
    formula: formula,
    rollResult: rollResult,
    rollTarget: rollTarget,
    rollFor: rollFor.toUpperCase(),
    rollResultColour: getResultColour(rollResult, rollTarget),
    resultCategory: getResultCategory(rollTarget, rollResult, rollType, diceOne, diceTwo)
  }

  if (game.dice3d) {
    await game.dice3d.showForRoll(roll, game.user, true, null, false);
  }

  messageData.content = await renderTemplate(rollTemplate, cardData);
  messageData.roll = true;
  return ChatMessage.create(messageData);
};

const getResultCategory = (rollTarget, rollResult, rollType, diceOne, diceTwo) => {
  if (rollResult === 20) {
    return "Fumble!";
  } else if (rollResult === rollTarget) {
    return "Crit!";
  } else if (rollResult <= rollTarget) {
    if (diceOne === diceTwo && rollType === "doublePositive") {
      return "Successful positive pair!";
    } else {
      return "Success";
    }
  } else {
    if (diceOne === diceTwo && rollType === "doubleNegative") {
      return "Unsuccessful negative pair!";
    } else {
      return "Failure";
    }
  };
}

const taskRollDialogCallback = (html, actor, rollAttribute, rollType = 'roll') => {
  const rollMod = Number.parseInt(html.find('.mod-prompt.dialog [name="roll_modifier"]')[0].value);
  if (isNaN(rollMod)) {
    ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
  } else {
    taskRoll(actor, rollMod, rollAttribute, rollType);
  }
};

const attackRollDialogCallback = (html, item = null, rollType = 'roll') => {
  const toHitMod = Number.parseInt(html.find('.mod-prompt.dialog [name="attack_modifier"]')[0].value);
  const damageMod = Number.parseInt(html.find('.mod-prompt.dialog [name="damage_modifier"]')[0].value);
  if (isNaN(toHitMod) || isNaN(damageMod)) {
    ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
  } else {
    item.weaponAttack(item, toHitMod, damageMod, rollType);
  }
};
