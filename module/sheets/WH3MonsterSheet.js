import { rollModDialog, attackModDialog } from '../diceHelpers.js';

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
    }

    super.activateListeners(html);
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
    rollModDialog(this.actor, 'savingThrow', 'Saving Throw');
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
        img: "icons/svg/mystery-man.svg",
        name: this.actor.name,
        type: "Weapon",
        data: {
          description: "",
          damage: this.actor.data.data.damage,
          weight: "regular",
          rateOfFire: "none"
        }
      };
      await this.actor.createOwnedItem(newItem);
    }
    monsterAttackItem = this.actor.items.entries[0];

    attackModDialog(monsterAttackItem);
  };

}