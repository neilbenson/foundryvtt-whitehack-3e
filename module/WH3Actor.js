import * as c from './constants.js';

class WH3Actor extends Actor {
  manageGroupsDialog(attribute) {
    const groupTypes = [c.AFFILIATION, c.SPECIES, c.VOCATION];
    const groups = this.data.items.filter(item => item.type === c.ABILITY &&
      item.data.activeStatus === c.ACTIVE && groupTypes.includes(item.data.type));
    let groupsHtml = c.EMPTYSTRING;
    groups.forEach(element => {
      groupsHtml = groupsHtml + `
      <div>
        <input type="checkbox" id="${element._id}" name="${element._id}" value="${element.name}">
        <label for="${element._id}">${element.name}</label>
      </div>`
    });

    const content = `
    <div class="dialog groups-list">
      ${groupsHtml}
    </div>`;

    new Dialog({
      title: game.i18n.localize("wh3e.actor.selectGroupsFor") + " " + attribute.toUpperCase(),
      content: content,
      default: "ok",
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("wh3e.sheet.update"),
          default: true,
          callback: (html) => this.updateGroupsForActor(attribute, html)
        }
      },
    }, { width: 250 }).render(true);
  };

  clearGroupsDialog(attribute) {
    const content = `
      <div class="margin">
        <p>${game.i18n.localize("wh3e.actor.confirmClearGroups")} ${attribute.toUpperCase()}</p>
      </div>
    `;
    new Dialog({
      title: game.i18n.localize("wh3e.actor.clearGroupsFor") + " " + attribute.toUpperCase(),
      content: content,
      default: "ok",
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("wh3e.sheet.clear"),
          callback: (html) => this.update({ data: { attributes: { [attribute]: { groups: c.EMPTYSTRING } } } })
        }
      },
    }, { width: 50 }).render(true);
  };

  updateGroupsForActor = (attribute, html) => {
    let selectedGroupsArray = [];

    html.find('.groups-list.dialog input').each((index, group) => {
      if (group.checked) {
        selectedGroupsArray.push(group.value);
      }
    });

    this.update({
      data: {
        attributes: {
          [attribute]: {
            groups: selectedGroupsArray.join(", ")
          }
        }
      }
    })
  }

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
    const die = c.ONED6;
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