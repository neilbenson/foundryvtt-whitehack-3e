export default class WH3CharacterSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wh3e/templates/sheets/character-sheet.hbs",
      classes: ["wh3e", "sheet", "character"],
      width: 600,
      height: 550
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    data.weapons = data.items.filter((item) => item.type === "weapon");
    return data;
  }
}