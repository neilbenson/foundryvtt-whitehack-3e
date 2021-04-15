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
  }
}