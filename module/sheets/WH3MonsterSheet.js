import { rollModDialog, attackModDialog } from '../helpers/diceHelpers.js';

export default class WH3MonsterSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wh3e/templates/sheets/monster-sheet.hbs",
      classes: ["wh3e", "sheet", "monster"],
      width: 600,
      height: 450,
      resizable: false
    })
  };

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    data.hasToken = !(this.token === null);
    return data;
  };

  async activateListeners(html) {
    if (this.isEditable) {
      await html.find(".hitDiceBase").change(this._onUpdateMonster.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find("label.attack-roll").click(this._onCreateAttack.bind(this));
      html.find("label.savingThrow").click(this._onShowSavingThrowModDialog.bind(this));
      html.find('.init-label').click(this._onRollInitiative.bind(this));
    }

    super.activateListeners(html);
  };

  _onRollInitiative(event) {
    event.preventDefault()
    this.actor.rollInitiative(this.token)
  };

  _onUpdateMonster(event) {
    const newHDBase = parseInt(event.currentTarget.value);
    this.actor.update({
      data: {
        savingThrow: newHDBase + 5,
        combat: {
          attackValue: newHDBase + 10
        }
      }
    })
  };

  _onShowSavingThrowModDialog() {
    rollModDialog(this.actor, c.SAVINGTHROW, game.i18n.localize("wh3e.sheet.savingThrow"));
  };

  async _onCreateAttack() {
    // To use the diceHelper.js attackRoll need to create an item
    // for the monster attack
    await this.actor.update({
      items: []
    });
    let monsterAttackItem = null;
    if (this.actor.items.entries[0] === undefined) {
      let newItem = {
        img: c.DEFAULTACTORIMAGE,
        name: this.actor.name,
        type: c.WEAPON,
        data: {
          description: c.EMPTYSTRING,
          damage: this.actor.data.data.damage,
          weight: c.REGULAR,
          rateOfFire: c.NONE
        }
      };
      await this.actor.createOwnedItem(newItem);
    }
    monsterAttackItem = this.actor.items.entries[0];

    attackModDialog(monsterAttackItem);
  };

}