class WH3Actor extends Actor {
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