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
    data.abilities = data.items.filter((item) => item.type === "Ability");

    return data;
  }

  activateListeners(html) {
    if (this.isEditable) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".attack-roll").click(this._onAttackRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onAttackRoll(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    item.rollWeaponAttack(item);
  }

  _onItemRoll(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    item.sendInfoToChat();
  }

  _onItemCreate(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let itemData = {
      img: "icons/svg/mystery-man.svg",
      name: game.i18n.localize("wh3e.sheet.new" + element.dataset.type),
      type: element.dataset.type,
      data: {
        description: ""
      }
    };

    if (element.dataset.type === "Ability") {
      itemData.data.type = "slot";
    }

    if (element.dataset.type === "Gear") {
      itemData.data.weight = "regular";
    }

    if (element.dataset.type === "Weapon") {
      itemData.data.damage = 'd6';
      itemData.data.weight = "regular";
      itemData.data.rateOfFire = "none";
    }

    return this.actor.createOwnedItem(itemData);
  }

  _onItemEdit(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    return this.actor.deleteOwnedItem(itemId);
  }

}