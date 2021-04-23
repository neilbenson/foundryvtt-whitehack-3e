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
    title: item.name + " " + game.i18n.localize("wh3e.combat.attack"),
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

  const toHitTarget = actor.data.data.combat.attackValue + strMod + toHitMod;
  const rollTemplate = "systems/wh3e/templates/chat/attack-roll.hbs";

  // To Hit Roll
  const toHitRoll = new Roll(getDiceToRoll(rollType), rollData).evaluate();
  toHitRoll.toMessage(messageData, { rollMode: null, create: false });

  const diceOne = toHitRoll.terms[0].results[0].result;
  const diceTwo = toHitRoll.terms[0].results.length > 1 ? toHitRoll.terms[0].results[1].result : null;
  const toHitResult = getRollResult(rollType, toHitTarget, diceOne, diceTwo);

  if (game.dice3d) {
    await game.dice3d.showForRoll(toHitRoll, game.user, true, null, false);
  }

  const toHitHeader = getToHitResultHeader(toHitResult, weapon.name, toHitTarget);
  const toHitResultCategory = getResultCategory(toHitTarget, toHitResult, rollType, diceOne, diceTwo);

  cardData = {
    ...cardData,
    diceOne: diceOne,
    diceTwo: diceTwo,
    formula: getRollTypeText(rollType, toHitRoll.formula),
    rollResult: toHitResult,
    toHitHeader: toHitHeader + " - " + toHitResultCategory,
    rollResultColour: getResultColour(toHitResult, toHitTarget)
  }

  if (toHitResult <= toHitTarget) {
    // Hit - Damage Roll
    let rollFormula = "(" + game.i18n.localize("wh3e.damageDice." + weapon.data.data.damage) + ")" + " + @strDmgMod + @damageMod";
    const damageRoll = new Roll(rollFormula, rollData).evaluate();
    damageRoll.toMessage(messageData, { rollMode: null, create: false });

    cardData.damageTemplate = await damageRoll.render();
    cardData.damageResult = damageRoll.total;
    cardData.damageHeader = getDamageResultHeader(weapon.name, damageRoll.total);

    if (game.dice3d) {
      await game.dice3d.showForRoll(damageRoll, game.user, true, null, false);
    }
  }

  messageData.content = await renderTemplate(rollTemplate, cardData);
  messageData.roll = true;
  return ChatMessage.create(messageData);
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
  roll.toMessage(messageData, { rollMode: null, create: false });

  // Get results data
  const diceOne = roll.terms[0].results[0].result;
  const diceTwo = roll.terms[0].results.length > 1 ? roll.terms[0].results[1].result : null;
  const rollResult = getRollResult(rollType, rollTarget, diceOne, diceTwo);
  const resultHeader = getRollResultHeader(rollFor, rollTarget, rollResult, rollType, diceOne, diceTwo);

  cardData = {
    ...cardData,
    rollTemplate: await roll.render(),
    diceOne: diceOne,
    diceTwo: diceTwo,
    formula: getRollTypeText(rollType, roll.formula),
    rollResult: rollResult,
    resultHeader: resultHeader,
    rollResultColour: getResultColour(rollResult, rollTarget)
  }

  if (game.dice3d) {
    await game.dice3d.showForRoll(roll, game.user, true, null, false);
  }

  messageData.content = await renderTemplate(rollTemplate, cardData);
  messageData.roll = true;
  return ChatMessage.create(messageData);
};

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

const getRollResultHeader = (rollFor, rollTarget, rollResult, rollType, diceOne, diceTwo) => {
  let resultHeader = "";
  if (rollFor === "savingThrow") {
    resultHeader = game.i18n.localize("wh3e.dice.savingThrowVsTarget");
  } else {
    resultHeader = rollFor.toUpperCase() + " " + game.i18n.localize("wh3e.dice.taskRollVsTarget");
  }
  return resultHeader + " " + rollTarget + " - " + getResultCategory(rollTarget, rollResult, rollType, diceOne, diceTwo);
};

const getToHitResultHeader = (toHitResult, weapon, toHitTarget) => {
  const attackVsTarget = game.i18n.localize("wh3e.combat.attackVsTarget");
  const hitsAC = game.i18n.localize("wh3e.combat.hitsAC");
  return `${weapon} ${attackVsTarget} ${toHitTarget} ${hitsAC} ${toHitResult}`
};

const getDamageResultHeader = (weapon, damageResult) => {
  const hitsFor = game.i18n.localize("wh3e.combat.hitsFor");
  const damage = game.i18n.localize("wh3e.combat.damage");
  return `${weapon} ${hitsFor} ${damageResult} ${damage}`;
};


const getResultCategory = (rollTarget, rollResult, rollType, diceOne, diceTwo) => {
  if (rollResult === 20) {
    return game.i18n.localize("wh3e.dice.fumble");
  } else if (rollResult === rollTarget) {
    return game.i18n.localize("wh3e.dice.crit");
  } else if (rollResult <= rollTarget) {
    if (diceOne === diceTwo && rollType === "doublePositive") {
      return game.i18n.localize("wh3e.dice.successfulPositivePair");
    } else {
      return game.i18n.localize("wh3e.dice.success");
    }
  } else {
    if (diceOne === diceTwo && rollType === "doubleNegative") {
      return game.i18n.localize("wh3e.dice.unsuccessfulNegativePair");
    } else {
      return game.i18n.localize("wh3e.dice.failure");
    }
  };
};

const getRollTypeText = (rollType, rollFormula) => {
  switch (rollType) {
    case "doublePositive":
      return game.i18n.localize("wh3e.dice.doublePositiveText");
    case "doubleNegative":
      return game.i18n.localize("wh3e.dice.doubleNegativeText");
    default:
      return rollFormula;
  }
};

const getRollResult = (rollType, rollTarget, diceOne, diceTwo) => {
  const highestResult = diceOne >= diceTwo ? diceOne : diceTwo;
  const lowestResult = diceOne < diceTwo ? diceOne : diceTwo;

  let rollResult = diceOne;

  // If double positive roll keep the highest under rollTarget
  // If double negative keep just the highest
  if (rollType === "doublePositive") {
    rollResult = highestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = lowestResult;
    }
  } else if (rollType === "doubleNegative") {
    rollResult = lowestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = highestResult;
    }
  }
  return rollResult;
};