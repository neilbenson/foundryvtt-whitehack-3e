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
          .slice(0, 24);
        if (descriptionLength > 24) {
          item.data.description = item.data.description.concat('...');
        }
        return item;
      }
    });

    return data;
  }

  activateListeners(html) {
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    super.activateListeners(html);
  }

  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize("wh3e.sheet.newAbility"),
      type: element.dataset.type,
      data: {
        type: "slot",
        description: ""
      }
    };

    return this.actor.createOwnedItem(itemData);
  }

  _onItemEdit(event) {
    event.preventDefault();

    let element = event.currentTarget;
    let itemId = element.closest("tr").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);

    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();

    let element = event.currentTarget;
    let itemId = element.closest("tr").dataset.itemId;
    return this.actor.deleteOwnedItem(itemId);
  }
}