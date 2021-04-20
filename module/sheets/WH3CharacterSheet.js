import { updateEquipmentValues } from '../equipmentHelpers.js';
import { rollModDialog, attackModDialog } from '../diceHelpers.js';

export default class WH3CharacterSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wh3e/templates/sheets/character-sheet.hbs",
      classes: ["wh3e", "sheet", "character"],
      width: 600,
      height: 584,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "attributes" }],
      resizable: false
    })
  };

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    data.weapons = data.items.filter((item) => item.type === "Weapon");
    data.gear = data.items.filter((item) => item.type === "Gear");
    data.abilities = data.items.filter((item) => item.type === "Ability");
    data.armour = data.items.filter((item) => item.type === "Armour");
    data.charClass = data.data.basics.class;
    data.hasToken = !(this.token === null);
    return data;
  };

  activateListeners(html) {
    if (this.isEditable) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".attribute-score").change(this._onAttributeChange.bind(this));
      html.find(".ability-activated-column i").click(this._onToggleAbility.bind(this));
      html.find(".equippable i").click(this._onToggleGear.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find(".item-description").click(this._onItemRoll.bind(this));
      html.find(".attack-roll").click(this._onShowAttackModDialog.bind(this));
      html.find(".attribute label").click(this._onShowRollModDialog.bind(this));
      html.find("label.savingThrow").click(this._onShowRollModDialog.bind(this));
      html.find('.init-label').click(this._onRollInitiative.bind(this));
    }

    super.activateListeners(html);
  };

  _onRollInitiative(event) {
    event.preventDefault()
    this.actor.rollInitiative(this.token)
  };

  async _onDrop(event) {
    await super._onDrop(event);
    updateEquipmentValues(this.actor);
  };

  getItem(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    return this.actor.getOwnedItem(itemId);
  };

  async _onToggleGear(event) {
    const item = this.getItem(event);
    await item.update(
      {
        data: {
          equippedStatus: this.updateEquippedStatus(item.data.data.equippedStatus)
        }
      }
    );
    updateEquipmentValues(this.actor);
  };

  updateEquippedStatus(equippedStatus) {
    if (equippedStatus === "stored") {
      return "equipped";
    } else {
      return "stored";
    };
  };

  _onToggleAbility(event) {
    const item = this.getItem(event);
    item.update(
      {
        data: {
          activeStatus: this.updateActiveStatus($(event.currentTarget))
        }
      }
    )
  };

  updateActiveStatus(icon) {
    if (icon.hasClass("inactive")) {
      return "active";
    } else {
      return "inactive";
    }
  };

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
    });
  };

  _onShowAttackModDialog(event) {
    const item = this.getItem(event);
    attackModDialog(item);
  };

  _onShowRollModDialog(event) {
    const rollAttribute = event.currentTarget.dataset.rollFor;
    const rollTitle = rollAttribute === 'savingThrow' ? 'Saving Throw' : rollAttribute.toUpperCase() + " task roll!";
    rollModDialog(this.actor, rollAttribute, rollTitle);
  };

  _onItemRoll(event) {
    const item = this.getItem(event);

    item.sendInfoToChat();
  };

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;

    let itemData = {
      img: "icons/svg/mystery-man.svg",
      name: game.i18n.localize("wh3e.sheet.new" + type),
      type: type,
      data: {
        description: ""
      }
    };

    if (type === "Ability") {
      itemData.data.activeStatus = "inactive";
    }

    if (type === "Gear") {
      itemData.data.weight = "regular";
      itemData.data.equippedStatus = "stored";
    }

    if (type === "Armour") {
      itemData.data.armourClass = 0;
      itemData.data.equippedStatus = "stored";
    }

    if (type === "Weapon") {
      itemData.data.damage = 'd6';
      itemData.data.weight = "regular";
      itemData.data.rateOfFire = "none";
      itemData.data.equippedStatus = "stored";
    }

    await this.actor.createOwnedItem(itemData);
    if (type !== "Ability") {
      updateEquipmentValues(this.actor);
    }
  };

  _onItemEdit(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    item.sheet.render(true);
  };

  async _onItemDelete(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    await this.actor.deleteOwnedItem(itemId);
    updateEquipmentValues(this.actor);
  };

}