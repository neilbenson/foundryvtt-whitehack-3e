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
      html.find(".item-description").click(this._onItemRoll.bind(this));
      html.find(".attack-roll").click(this._onShowAttackModDialog.bind(this));
      html.find(".attribute label").click(this._onShowRollModDialog.bind(this));
      html.find("label.savingThrow").click(this._onShowRollModDialog.bind(this));
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

  _onShowAttackModDialog(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
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
  }

  attackRollDialogCallback(html, item = null, rollType = 'roll') {
    const toHitMod = Number.parseInt(html.find('.mod-prompt.dialog [name="attack_modifier"]')[0].value);
    const damageMod = Number.parseInt(html.find('.mod-prompt.dialog [name="damage_modifier"]')[0].value);
    if (isNaN(toHitMod) || isNaN(damageMod)) {
      ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
    } else {
      item.weaponAttack(item, toHitMod, damageMod, rollType);
    }
  }

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

    new Dialog({
      title: rollAttribute.toUpperCase() + " task Roll!",
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
  }

  taskRollDialogCallback(html, rollAttribute, rollType = 'roll') {
    const rollMod = Number.parseInt(html.find('.mod-prompt.dialog [name="roll_modifier"]')[0].value);
    if (isNaN(rollMod)) {
      ui.notifications.error(game.i18n.localize("wh3e.errors.modsNotNumbers"));
    } else {
      this.actor.taskRoll(rollMod, rollAttribute, rollType);
    }
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