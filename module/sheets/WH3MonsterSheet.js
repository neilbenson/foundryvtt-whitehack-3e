export default class WH3MonsterSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wh3e/templates/sheets/monster-sheet.hbs",
      classes: ["wh3e", "sheet", "monster"],
      width: 600,
      height: 450
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    return data;
  }
}