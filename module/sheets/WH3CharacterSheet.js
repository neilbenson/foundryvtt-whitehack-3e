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
    data.charClass = data.data.basics.class;
    return data;
  }

  activateListeners(html) {
    if (this.isEditable) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".attribute-score").change(this._onAttributeChange.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".attack-roll").click(this._onAttackRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onAttributeChange(event) {
    const attrName = event.currentTarget.name.split(".")[2];
    const attrValue = event.currentTarget.value;

    let modObj = { strMod: 0, dmgMod: 0, dexMod: 0, conMod: 0, intMod: 0, wisMod: 0 };

    // Set STR modifiers for attack and damage
    if (attrName === 'str') {
      if (attrValue >= 13) {
        modObj.strMod = 1;
        if (attrValue >= 16) {
          modObj.dmgMod = 1;
        }
      }
    }

    // Set modifiers for other attributes
    const attrs = ['dex', 'con', 'int', 'wis'];
    attrs.forEach(element => {
      if (attrName === element) {
        if (attrValue >= 13) {
          modObj[element + 'Mod'] = 1;
          if (attrValue >= 16) {
            modObj[element + 'Mod'] = 1;
          }
        }
      }
    });

    // Update data
    this.actor.update({
      'data.attributes.str.mod': modObj.strMod,
      'data.attributes.str.dmgMod': modObj.dmgMod,
      'data.attributes.dex.mod': modObj.dexMod,
      'data.attributes.con.mod': modObj.conMod,
      'data.attributes.int.mod': modObj.intMod,
      'data.attributes.wis.mod': modObj.wisMod
    })
  }

  _onAttackRoll(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    item.weaponAttack(item);
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