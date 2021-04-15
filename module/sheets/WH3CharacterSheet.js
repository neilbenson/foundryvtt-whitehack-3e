import { updateEquipmentValues } from '../equipmentHelpers.js';

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
    }

    super.activateListeners(html);
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

  _onAttackRoll(event) {
    const item = this.getItem(event);

    item.weaponAttack(item);
  }

  _onShowAttackModDialog(event) {
    const item = this.getItem(event);
    const toHitModLabel = game.i18n.localize("wh3e.modifiers.toHitMod");
    const damageModLabel = game.i18n.localize("wh3e.modifiers.damageMod");
    const content = `
    <div class="dialog mod-prompt grid grid-2col flex-group-center">
      <div class="form-group">
        <label for="attack_modifier">${toHitModLabel}</label>
        <input type="number" id="attack_modifier" name="attack_modifier" value="0"/>
      </div>
      <div class="form-group">
        <label for="damage_modifier">${damageModLabel}</label>
        <input type="number" id="damage_modifier" name="damage_modifier" value="0"/>
      </div>
    </div>`;

    new Dialog({
      title: "Attack!",
      content: content,
      default: "ok",
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: null,
          default: true,
          callback: (html) => this.attackRollDialogCallback(html, item)
        },
        doublePositiveRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
          label: null,
          default: true,
          callback: (html) => this.attackRollDialogCallback(html, item, 'doublePositive')
        },
        doubleNegativeRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
          label: null,
          default: true,
          callback: (html) => this.attackRollDialogCallback(html, item, 'doubleNegative')
        },
      },
    }, { width: 50 }).render(true);
  };

  attackRollDialogCallback(html, item = null, rollType = 'roll') {
    const toHitMod = Number.parseInt(html.find('.mod-prompt.dialog [name="attack_modifier"]')[0].value);
    const damageMod = Number.parseInt(html.find('.mod-prompt.dialog [name="damage_modifier"]')[0].value);
    if (isNaN(toHitMod) || isNaN(damageMod)) {
      ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
    } else {
      item.weaponAttack(item, toHitMod, damageMod, rollType);
    }
  };

  _onShowRollModDialog(event) {
    const rollModLabel = game.i18n.localize("wh3e.modifiers.rollMod");
    const rollAttribute = event.currentTarget.dataset.rollFor;
    const content = `
    <div class="dialog mod-prompt flex-group-center">
      <div class="form-group">
        <label for="roll_modifier">${rollModLabel}</label>
        <input type="number" id="roll_modifier" name="roll_modifier" value="0"/>
      </div>
    </div>`;

    const rollTitle = rollAttribute === 'savingThrow' ? 'Saving Throw' : rollAttribute.toUpperCase() + " task Roll!";

    new Dialog({
      title: rollTitle,
      content: content,
      default: "ok",
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: null,
          default: true,
          callback: (html) => this.taskRollDialogCallback(html, rollAttribute)
        },
        doublePositiveRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-plus"></i>',
          label: null,
          default: true,
          callback: (html) => this.taskRollDialogCallback(html, rollAttribute, 'doublePositive')
        },
        doubleNegativeRoll: {
          icon: '<i class="fas fa-dice-d20"></i><i class="fas fa-minus"></i>',
          label: null,
          default: true,
          callback: (html) => this.taskRollDialogCallback(html, rollAttribute, 'doubleNegative')
        },
      },
    }, { width: 50 }).render(true);
  };

  taskRollDialogCallback(html, rollAttribute, rollType = 'roll') {
    const rollMod = Number.parseInt(html.find('.mod-prompt.dialog [name="roll_modifier"]')[0].value);
    if (isNaN(rollMod)) {
      ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
    } else {
      this.actor.taskRoll(rollMod, rollAttribute, rollType);
    }
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