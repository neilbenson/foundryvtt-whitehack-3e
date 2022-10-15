import * as c from "../constants.js";

/**
 * Determines success/fail based on rolled result, target and AC
 * @param {number} rollResult
 * @param {number} rollTarget
 * @returns {string}
 */
export const getRollOutcome = (rollResult, rollTarget, rollAC = 0) => {
  // Determines a fail if rollResult is 20 and rollTarget >=20
  // If extreme roll 20 is still a fail
  // let extremeRollResult = rollResult;
  if (rollTarget >= 20) {
    if (rollResult === 19) {
      return c.SUCCESS;
    } else if (rollResult === 20) {
      return c.FAIL;
    }
    rollResult = rollResult + rollTarget - 20;
  }
  if (rollResult > rollAC && rollResult <= rollTarget) {
    return c.SUCCESS;
  } else {
    return c.FAIL;
  }
};

/**
 * Show dialog for task roll/saving throw
 * @param {Object} actor
 * @param {string} rollAttribute
 * @param {string} rollTitle
 */
export const rollModDialog = (actor, rollAttribute, rollTitle) => {
  const rollModLabel = game.i18n.localize("wh3e.modifiers.rollMod");
  const content = `
  <div class="dialog mod-prompt flex-group-center">
    <div class="form-group">
      <label for="roll_modifier">${rollModLabel}</label>
      <input type="number" id="roll_modifier" name="roll_modifier" value="0"/>
    </div>
  </div>`;

  new Dialog(
    {
      title: rollTitle,
      content: content,
      default: c.ROLL,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: null,
          callback: (html) => taskRollDialogCallback(html, actor, rollAttribute),
        },
        doublePositiveRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
          label: null,
          callback: (html) => taskRollDialogCallback(html, actor, rollAttribute, c.DOUBLEPOSITIVE),
        },
        doubleNegativeRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
          label: null,
          callback: (html) => taskRollDialogCallback(html, actor, rollAttribute, c.DOUBLENEGATIVE),
        },
      },
    },
    { width: 200 }
  ).render(true);
};

/**
 * Show dialog for attack roll
 * @param {Object} item
 */
export const attackRollDialog = (item) => {
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

  new Dialog(
    {
      title: item.name + " " + game.i18n.localize("wh3e.combat.attack"),
      content: content,
      default: c.ROLL,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: null,
          callback: (html) => attackRollDialogCallback(html, item),
        },
        doublePositiveRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
          label: null,
          callback: (html) => attackRollDialogCallback(html, item, c.DOUBLEPOSITIVE),
        },
        doubleNegativeRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
          label: null,
          callback: (html) => attackRollDialogCallback(html, item, c.DOUBLENEGATIVE),
        },
      },
    },
    { width: 250 }
  ).render(true);
};

/**
 * Builds attack and damage rolls, executes and send results to chat
 * @param {Object} weapon
 * @param {Object} actor
 * @param {number=0} toHitMod
 * @param {number=0} damageMod
 * @param {string} rollType
 */
export const attackRoll = async (weapon, toHitMod = 0, damageMod = 0, rollType = c.ROLL) => {
  let strMod = 0;
  let strDmgMod = 0;
  const actor = weapon.actor;
  if (actor.type !== c.MONSTER && actor.system.basics.class === c.THESTRONG) {
    strMod = actor.system.attributes.str.mod;
    strDmgMod = actor.system.attributes.str.dmgMod;
  }

  const rollData = {
    strMod: strMod,
    strDmgMod: strDmgMod,
    damageMod: damageMod,
  };

  const messageData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
  };

  let cardData = {
    ...weapon,
    owner: actor.id,
  };

  // Only use targets AC if one target selected
  let targetName = null;
  let targetAC = 0;
  if (game.user.targets.size === 1) {
    for (let t of game.user.targets.values()) {
      targetAC = t.sheet.actor.system.combat.armourClass;
      targetName = t.document.name;
    }
  }

  const toHitTarget = actor.system.combat.attackValue + strMod + toHitMod;
  const rollTemplate = "systems/whitehack3e/templates/chat/attack-roll.hbs";

  // To Hit Roll
  const toHitRoll = await new Roll(getDiceToRoll(rollType), rollData).evaluate({ async: true });
  toHitRoll.toMessage(messageData, { rollMode: null, create: false });

  const diceOne = toHitRoll.terms[0].results[0].result;
  const diceTwo = toHitRoll.terms[0].results.length > 1 ? toHitRoll.terms[0].results[1].result : null;
  const toHitResult = getRollResult(rollType, toHitTarget, diceOne, diceTwo);

  if (game.dice3d) {
    await game.dice3d.showForRoll(toHitRoll, game.user, true, null, false);
  }

  const toHitOutcome = getRollOutcome(toHitResult, toHitTarget, targetAC);
  const toHitHeader = getToHitResultHeader(toHitOutcome, toHitResult, weapon.name, toHitTarget, targetAC, targetName);
  const toHitResultCategory = getResultCategory(toHitTarget, toHitResult, rollType, diceOne, diceTwo, toHitOutcome);
  const toHitResultCategoryWith = toHitResultCategory ? `${toHitResultCategory}` : "";

  cardData = {
    ...cardData,
    diceOne: diceOne,
    diceTwo: diceTwo,
    formula: getRollTypeText(rollType, toHitRoll.formula),
    rollResult: toHitResult,
    toHitHeader: `${toHitHeader} ${toHitResultCategoryWith}`,
    rollResultColour: toHitOutcome === c.SUCCESS ? c.GREEN : c.RED,
  };

  if (toHitOutcome === c.SUCCESS) {
    // Hit - Damage Roll
    let rollFormula =
      "(" + game.i18n.localize("wh3e.damageDice." + weapon.system.damage) + ")" + " + @strDmgMod + @damageMod";
    let damageRoll = await new Roll(rollFormula, rollData).evaluate({ async: true });
    damageRoll.toMessage(messageData, { rollMode: null, create: false });

    cardData.dmgFormula = damageRoll._formula;

    cardData.damageTemplate = await damageRoll.render();
    cardData.damageResult = damageRoll.total >= 1 ? damageRoll.total : 1;
    cardData.damageHeader = getDamageResultHeader(weapon.name, cardData.damageResult);

    // Different output if not Fixed Damage of 1: shows dice formula and dice results
    if (damageRoll.dice.length > 0) {
      cardData.dmgDice = damageRoll.dice[0].expression;
      cardData.damageDiceRolled = damageRoll.dice[0].results;
    } else {
      cardData.dmgDice = "Fixed damage";
      cardData.damageDiceRolled = [1];
    }

    if (game.dice3d) {
      await game.dice3d.showForRoll(damageRoll, game.user, true, null, false);
    }
  }

  messageData.content = await renderTemplate(rollTemplate, cardData);
  //messageData.roll = true;
  ChatMessage.create(messageData);
};

/**
 * Builds roll, execute and send results to chat
 * @param {Object} actor
 * @param {number} rollMod
 * @param {string} rollFor
 * @param {string} rollType
 */
const taskRoll = async (actor, rollMod, rollFor, rollType) => {
  const rollData = {
    rollMod: rollMod,
  };

  const messageData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
  };
  let cardData = {
    ...actor,
    owner: actor.id,
  };

  let rollValue = 0;
  if (rollFor === c.SAVINGTHROW) {
    rollValue = actor.system.savingThrow;
  } else {
    rollValue = actor.system.attributes[rollFor].value;
  }
  const rollTarget = rollValue + rollMod;
  const rollTemplate = "systems/whitehack3e/templates/chat/task-roll.hbs";

  // Check for extreme score
  if (rollTarget < 1) {
    ui.notifications.error(game.i18n.localize("wh3e.errors.noRollLessThanOne"));
    return;
  }

  // Task Roll
  const roll = await new Roll(getDiceToRoll(rollType), rollData).evaluate({ async: true });
  roll.toMessage(messageData, { rollMode: null, create: false });

  // Get results data
  const diceOne = roll.terms[0].results[0].result;
  const diceTwo = roll.terms[0].results.length > 1 ? roll.terms[0].results[1].result : null;
  const rollResult = getRollResult(rollType, rollTarget, diceOne, diceTwo);
  const rollOutcome = getRollOutcome(rollResult, rollTarget);
  const resultHeader = getRollResultHeader(rollFor, rollTarget, rollResult, rollType, diceOne, diceTwo, rollOutcome);

  cardData = {
    ...cardData,
    rollTemplate: await roll.render(),
    diceOne: diceOne,
    diceTwo: diceTwo,
    formula: getRollTypeText(rollType, roll.formula),
    rollResult: rollResult,
    resultHeader: resultHeader,
    rollResultColour: rollOutcome === c.SUCCESS ? c.GREEN : c.RED,
  };

  if (game.dice3d) {
    await game.dice3d.showForRoll(roll, game.user, true, null, false);
  }

  messageData.content = await renderTemplate(rollTemplate, cardData);
  // messageData.roll = true;
  ChatMessage.create(messageData);
};

/**
 * Grab dialog inputs and pass to taskRoll
 * @param {Object} html
 * @param {Object} actor
 * @param {string} rollAttribute
 * @param {string} rollType
 */
const taskRollDialogCallback = (html, actor, rollAttribute, rollType = c.ROLL) => {
  const rollMod = Number.parseInt(html.find('.mod-prompt.dialog [name="roll_modifier"]')[0].value);
  if (isNaN(rollMod)) {
    ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
  } else {
    taskRoll(actor, rollMod, rollAttribute, rollType);
  }
};

/**
 * Grab dialog inputs and pass to weaponAttack method on item
 * @param {Object} html
 * @param {Object} item
 * @param {string} rollType
 */
const attackRollDialogCallback = (html, item = null, rollType = c.ROLL) => {
  const toHitMod = Number.parseInt(html.find('.mod-prompt.dialog [name="attack_modifier"]')[0].value);
  const damageMod = Number.parseInt(html.find('.mod-prompt.dialog [name="damage_modifier"]')[0].value);
  if (isNaN(toHitMod) || isNaN(damageMod)) {
    ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
  } else {
    attackRoll(item, toHitMod, damageMod, rollType);
  }
};

/**
 * Get dice formula for rollType
 * @param {string} rollType
 * @returns {string}
 */
const getDiceToRoll = (rollType) => {
  switch (rollType) {
    case c.DOUBLEPOSITIVE:
      return "2d20kl";
    case c.DOUBLENEGATIVE:
      return "2d20kh";
    default:
      return "1d20";
  }
};

/**
 * Fetch header to display in chat for a task roll/saving throw
 * @param {string} rollFor Attribute the roll is for
 * @param {number} rollTarget
 * @param {number} rollResult
 * @param {string} rollType
 * @param {number} diceOne
 * @param {number} diceTwo
 * @returns {string}
 */
const getRollResultHeader = (rollFor, rollTarget, rollResult, rollType, diceOne, diceTwo, rollOutcome) => {
  let resultHeader = c.EMPTYSTRING;
  if (rollFor === c.SAVINGTHROW) {
    resultHeader = game.i18n.localize("wh3e.dice.savingThrowVsTarget");
  } else {
    resultHeader = rollFor.toUpperCase() + " " + game.i18n.localize("wh3e.dice.taskRollVsTarget");
  }
  return (
    resultHeader +
    " " +
    rollTarget +
    " - " +
    getResultCategory(rollTarget, rollResult, rollType, diceOne, diceTwo, rollOutcome, rollFor)
  );
};

/**
 * Fetch header to display in chat for an attack roll
 * @param {number} toHitResult
 * @param {string} weapon
 * @param {number} toHitTarget
 * @returns {string}
 */
const getToHitResultHeader = (toHitOutcome, toHitResult, weapon, toHitTarget, targetAC, targetName) => {
  const attackVsTarget = `(${game.i18n.localize("wh3e.actor.attackValue")} ${toHitTarget})`;
  const hitsAC = game.i18n.localize("wh3e.combat.hitsAC");
  const hits = game.i18n.localize("wh3e.combat.hits");
  let acHit = toHitResult - 1;
  // To handle extreme rolls where AV is greater than 20
  if (toHitTarget >= 20) {
    // Add over 20 to quality
    acHit = acHit + toHitTarget - 20;
  }
  let resultHeader = `${weapon} ${attackVsTarget} ${hitsAC} ${acHit}`;
  if (toHitOutcome === c.SUCCESS) {
    if (targetName) {
      resultHeader = `${weapon} ${attackVsTarget} ${hits} ${targetName}`;
    }
  } else {
    if (targetName) {
      if (toHitResult > targetAC) {
        resultHeader = `${weapon} ${attackVsTarget} ${game.i18n.localize("wh3e.combat.misses")} ${targetName}`;
      } else {
        resultHeader = `${weapon} ${attackVsTarget} ${game.i18n.localize("wh3e.combat.blockedByArmour")} ${targetName}`;
      }
    } else {
      resultHeader = `${weapon} ${attackVsTarget} ${game.i18n.localize("wh3e.combat.misses")}`;
    }
  }
  return resultHeader;
};

/**
 * Fetch header to display in chat for a damage roll
 * @param {string} weapon
 * @param {number} damageResult
 * @returns {string}
 */
const getDamageResultHeader = (weapon, damageResult) => {
  const hitsFor = game.i18n.localize("wh3e.combat.hitsFor");
  const damage = game.i18n.localize("wh3e.combat.damage");
  return `${weapon} ${hitsFor} ${damageResult} ${damage}`;
};

/**
 * Fetch result category, success, failure, crit etc
 * @param {number} rollTarget
 * @param {number} rollResult
 * @param {string} rollType
 * @param {number} diceOne
 * @param {number} diceTwo
 * @returns {string}
 */
const getResultCategory = (rollTarget, rollResult, rollType, diceOne, diceTwo, diceOutcome, rollFor = null) => {
  let category = [];
  if (diceOutcome === c.SUCCESS) {
    let extremeRollQuality = game.i18n.localize("wh3e.dice.withQuality") + " " + rollResult.toString();
    if (diceOne === diceTwo && rollType === c.DOUBLEPOSITIVE && diceOutcome === c.SUCCESS) {
      category.push(game.i18n.localize("wh3e.dice.successfulPositivePair"));
    }
    // If extreme roll will crit on 19, so target becomes 19
    if (rollTarget >= 20) {
      extremeRollQuality =
        game.i18n.localize("wh3e.dice.withQuality") + " " + (rollResult + rollTarget - 20).toString();
      rollTarget = 19;
    }
    if (rollResult === rollTarget) {
      category.push(game.i18n.localize("wh3e.dice.crit"));
    }
    if (category.length === 0 && rollFor) {
      category.push(game.i18n.localize("wh3e.dice.success"));
    }
    if (rollFor) {
      // Only push on quality for ST and Task Checks
      category.push(extremeRollQuality);
    }
  } else {
    if (diceOne === diceTwo && rollType === c.DOUBLENEGATIVE && diceOutcome === c.FAIL) {
      category.push(game.i18n.localize("wh3e.dice.unsuccessfulNegativePair"));
    }
    if (rollResult === 20 && rollTarget < 20) {
      category.push(game.i18n.localize("wh3e.dice.fumble"));
    }
    if (category.length === 0 && rollFor) {
      category.push(game.i18n.localize("wh3e.dice.failure"));
    }
  }
  return category.join(" ");
};

/**
 * Fetch text to display for dice rolled
 * @param {string} rollType
 * @param {string} rollFormula
 * @returns {string}
 */
const getRollTypeText = (rollType, rollFormula) => {
  switch (rollType) {
    case c.DOUBLEPOSITIVE:
      return game.i18n.localize("wh3e.dice.doublePositiveText");
    case c.DOUBLENEGATIVE:
      return game.i18n.localize("wh3e.dice.doubleNegativeText");
    default:
      return rollFormula;
  }
};

/**
 * Determine appropriate result from two inputs based on rollType
 * @param {string} rollType
 * @param {number} rollTarget
 * @param {number} diceOne
 * @param {number} diceTwo
 * @returns {number}
 */
const getRollResult = (rollType, rollTarget, diceOne, diceTwo) => {
  const highestResult = diceOne >= diceTwo ? diceOne : diceTwo;
  const lowestResult = diceOne < diceTwo ? diceOne : diceTwo;

  let rollResult = diceOne;

  // If double positive roll keep the highest under rollTarget
  // If double negative keep just the highest
  if (rollType === c.DOUBLEPOSITIVE) {
    rollResult = highestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = lowestResult;
    }
  } else if (rollType === c.DOUBLENEGATIVE) {
    rollResult = lowestResult;
    if ((lowestResult <= rollTarget && highestResult > rollTarget) || highestResult === 20) {
      rollResult = highestResult;
    }
  }
  return rollResult;
};
