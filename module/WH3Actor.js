import { getDiceToRoll, getResultColour, getResultCategory } from './helpers/diceHelpers.js';

class WH3Actor extends Actor {
  async taskRoll(rollMod, rollFor, rollType) {
    const rollData = {
      rollMod: rollMod
    };

    const messageData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.data.id
    };

    let rollValue = 0;
    if (rollFor === 'savingThrow') {
      rollValue = this.data.data.savingThrow;
    } else {
      rollValue = this.data.data.attributes[rollFor].value;
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

  /**
 * Roll Initiative
 * Liberally borrowed from DCC Actor sheet with some improvements
 * @param {Object} token    The token to roll initiative for
 */
  async rollInitiative(token) {
    // No selected token - bail out
    if (!token) {
      return ui.notifications.warn(game.i18n.localize('wh3e.combat.noTokenForInitiative'))
    }

    // No combat active
    if (!game.combat) {
      return ui.notifications.warn(game.i18n.localize('wh3e.combat.noActiveCombat'))
    }

    // Set initiative value in the combat tracker if appropriate
    const tokenId = token.id
    const combatant = game.combat.getCombatantByToken(tokenId)
    if (!combatant) {
      return ui.notifications.warn(game.i18n.format('wh3e.combat.tokenNotInCombatTracker', {
        name: token.name
      }))
    }

    // Setup the roll
    const die = '1d6';
    const init = this.data.data.attributes.dex.mod;
    const roll = new Roll('@die+@init', { die, init });

    // Convert the roll to a chat message
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize('wh3e.combat.initiative')
    })

    await game.combat.setInitiative(combatant._id, roll.total)
  }

};

export default WH3Actor;