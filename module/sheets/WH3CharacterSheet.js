export default class WH3CharacterSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wh3e/templates/sheets/character-sheet.hbs",
      classes: ["wh3e", "sheet", "character"],
      width: 600,
      height: 550,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "attributes" }]
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    data.weapons = data.items.filter((item) => item.type === "Weapon");
    data.gear = data.items.filter((item) => item.type === "Gear");
    data.abilities = data.items.filter((item) => {
      if (item.type === "Ability") {
        let cleanedDescription = item.data.description.replace(/(<([^>]+)>)/ig, '');
        let descriptionLength = cleanedDescription.length;
        item.data.description = cleanedDescription.replace(/(<([^>]+)>)/ig, '')
          .slice(0, 12);
        if (descriptionLength > 12) {
          item.data.description = item.data.description.concat('...');
        }
        return item;
      }
    });

    return data;
  }
}