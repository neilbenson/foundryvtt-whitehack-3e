import { getDiceToRoll } from './diceHelpers.js';
import { getResultColour } from './diceHelpers.js';

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
    const rollResult = roll.toMessage(messageData, { rollMode: null, create: false });

    cardData = {
      ...cardData,
      rollResult: rollResult.roll.total,
      rollTarget: rollTarget,
      rollFor: rollFor.toUpperCase(),
      rollResultColour: getResultColour(rollResult.roll.total, rollTarget)
    }

    if (game.dice3d) {
      await game.dice3d.showForRoll(rollResult.roll, game.user, true, null, false);
    }

    messageData.content = await renderTemplate(rollTemplate, cardData);
    messageData.roll = true;
    return ChatMessage.create(messageData);
  };

};

export default WH3Actor;