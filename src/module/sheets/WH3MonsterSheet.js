import { rollModDialog, attackRollDialog } from "../helpers/diceHelpers.js";
import * as c from "../constants.js";

export default class WH3MonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/whitehack3e/templates/sheets/monster-sheet.hbs",
      classes: ["wh3e", "sheet", "monster"],
      width: c.MONSTER_SHEET_WIDTH,
      height: c.MONSTER_SHEET_HEIGHT,
      resizable: true,
    });
  }

  /**
   * Fetch Foundry data
   * @returns {Object}
   */
  getData() {
    const data = super.getData();
    let monsterData = data.actor;
    monsterData.config = CONFIG.wh3e;
    monsterData.hasToken = !(this.token === null);
    monsterData.editable = this.options.editable;
    return monsterData;
  }

  /**
   * Register event listeners
   * @param {Object} html
   */
  activateListeners(html) {
    if (this.isEditable) {
      html.find(".hitDiceBase").change(this._monsterUpdateStats.bind(this));
    }

    // Owner only listeners
    if (this.actor.isOwner) {
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
    let monsterAttackItem = null;
    if (this.actor.items.size < 1) {
      let newItem = {
        name: this.actor.name,
        type: c.WEAPON,
        data: {
          description: c.EMPTYSTRING,
          damage: this.actor.system.damage,
          weight: c.REGULAR,
          rateOfFire: c.NONE,
        },
      };
      await this.actor.createEmbeddedDocuments("Item", [newItem]);
    }
    monsterAttackItem = this.actor.items.filter((item) => item)[0];

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
