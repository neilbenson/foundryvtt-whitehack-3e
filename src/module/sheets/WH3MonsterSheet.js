import { rollModDialog, attackRollDialog } from "../helpers/diceHelpers.js";
import * as c from "../constants.js";

export default class WH3MonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/whitehack3e/templates/sheets/monster-sheet.hbs",
      classes: ["wh3e", "sheet", "monster"],
      width: 600,
      height: 450,
      resizable: false,
    });
  }

  /**
   * Fetch Foundry data
   * @returns {Object}
   */
  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    data.hasToken = !(this.token === null);
    return data;
  }

  /**
   * Register event listeners
   * @param {Object} html
   */
  async activateListeners(html) {
    if (this.isEditable) {
      await html.find(".hitDiceBase").change(this._monsterUpdateStats.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find("label.attack-roll").click(this._attackRollHandler.bind(this));
      html.find("label.savingThrow").click(this._savingThrowRollHandler.bind(this));
      html.find(".init-label").click(this._initiativeRollHander.bind(this));
    }

    super.activateListeners(html);
  }

  /**
   * Update monster ST and AV based on Hit Dice
   * @param {Object} event
   */
  _monsterUpdateStats(event) {
    const newHDBase = parseInt(event.currentTarget.value);
    this.actor.update({
      data: {
        savingThrow: newHDBase + 5,
        combat: {
          attackValue: newHDBase + 10,
        },
      },
    });
  }

  /**
   * Create item to use as weapon for monster and pass to roll dialog
   */
  async _attackRollHandler() {
    // To use the diceHelper.js attackRoll need to create an item
    // for the monster attack
    await this.actor.update({
      items: [],
    });
    let monsterAttackItem = null;
    if (this.actor.items.entries[0] === undefined) {
      let newItem = {
        name: this.actor.name,
        type: c.WEAPON,
        data: {
          description: c.EMPTYSTRING,
          damage: this.actor.data.data.damage,
          weight: c.REGULAR,
          rateOfFire: c.NONE,
        },
      };
      await this.actor.createOwnedItem(newItem);
    }
    monsterAttackItem = this.actor.items.entries[0];

    attackRollDialog(monsterAttackItem);
  }

  /**
   * Call saving throw dialog
   */
  _savingThrowRollHandler() {
    rollModDialog(this.actor, c.SAVINGTHROW, game.i18n.localize("wh3e.sheet.savingThrow"));
  }

  /**
   * Roll initiative for monster
   */
  _initiativeRollHander() {
    this.actor.rollInitiative(this.token);
  }
}
