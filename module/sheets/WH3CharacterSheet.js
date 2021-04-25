import { updateActorForAbilities, updateActorForItems } from '../helpers/equipmentHelpers.js';
import { rollModDialog, attackModDialog } from '../helpers/diceHelpers.js';
import * as c from '../constants.js';

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
    data.weapons = data.items.filter(item => item.type === c.WEAPON);
    data.gear = data.items.filter(item => item.type === c.GEAR);
    data.abilities = data.items.filter(item => item.type === c.ABILITY);
    data.activeAbilities = data.abilities.filter(item => item.data.activeStatus === c.ACTIVE);
    data.armour = data.items.filter(item => item.type === c.ARMOUR);
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
      html.find(".ability-activated i").click(this._onToggleAbility.bind(this));
      html.find(".equippable i").click(this._onToggleGear.bind(this));
      html.find(".manage-groups").click(this._onShowGroupsDialog.bind(this));
      html.find(".clear-groups").click(this._onClearGroups.bind(this));
    }

    // Owner only listeners
    if (this.actor.owner) {
      html.find(".item-description").click(this._onShowItemInfo.bind(this));
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
    updateActorForItems(this.actor);
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
    updateActorForItems(this.actor);
  };

  updateEquippedStatus(equippedStatus) {
    if (equippedStatus === c.STORED) {
      return c.EQUIPPED;
    } else {
      return c.STORED;
    };
  };

  async _onToggleAbility(event) {
    const item = this.getItem(event);
    await item.update(
      {
        data: {
          activeStatus: this.updateActiveStatus($(event.currentTarget))
        }
      }
    );
    updateActorForAbilities(this.actor);
  };

  _onShowGroupsDialog(event) {
    this.actor.manageGroupsDialog(event.currentTarget.dataset.groupsFor);
  }

  _onClearGroups(event) {
    this.actor.clearGroupsDialog(event.currentTarget.dataset.groupsFor);
  }

  updateActiveStatus(icon) {
    if (icon.hasClass(c.INACTIVE)) {
      return c.ACTIVE;
    } else {
      return c.INACTIVE;
    }
  };

  async _onAttributeChange(event) {
    const attrName = event.currentTarget.name.split(".")[2];
    const attrValue = event.currentTarget.value;

    // Set STR modifiers for attack and damage
    if (attrName === c.STR) {
      let strMod = 0, dmgMod = 0;
      if (attrValue >= 13) {
        strMod = 1;
        if (attrValue >= 16) {
          dmgMod = 1;
        }
      }
      await this.actor.update({
        data: {
          attributes: {
            str: {
              mod: strMod,
              value: attrValue,
              dmgMod: dmgMod
            }
          }
        }
      });
      return;
    }

    // Set modifiers for other attributes
    let modObj = { [attrName + c.MOD]: 0 };
    if (attrName !== c.CHA) {
      if (attrValue >= 13) {
        if (attrValue < 16) {
          modObj[attrName + c.MOD] = 1;
        } else {
          modObj[attrName + c.MOD] = 2;
        }
      }
      await this.actor.update({
        data: {
          attributes: {
            [attrName]: {
              mod: modObj[attrName + c.MOD],
              value: attrValue
            }
          }
        }
      });
    }

  };

  _onShowAttackModDialog(event) {
    const item = this.getItem(event);
    attackModDialog(item);
  };

  _onShowRollModDialog(event) {
    const rollAttribute = event.currentTarget.dataset.rollFor;
    const rollTitle = rollAttribute === c.SAVINGTHROW ? game.i18n.localize("wh3e.sheet.savingThrow") :
      rollAttribute.toUpperCase() + " " + game.i18n.localize("wh3e.sheet.taskRoll");
    rollModDialog(this.actor, rollAttribute, rollTitle);
  };

  _onShowItemInfo(event) {
    const item = this.getItem(event);
    item.sendInfoToChat();
  };

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;

    let itemData = {
      img: c.DEFAULTACTORIMAGE,
      name: game.i18n.localize("wh3e.sheet.new" + type),
      type: type,
      data: {
        description: c.EMPTYSTRING
      }
    };

    if (type === c.ABILITY) {
      itemData.data.activeStatus = c.INACTIVE;
    }

    if (type === c.GEAR) {
      itemData.data.weight = c.REGULAR;
      itemData.data.equippedStatus = c.STORED;
    }

    if (type === c.ARMOUR) {
      itemData.data.armourClass = 0;
      itemData.data.equippedStatus = c.STORED;
    }

    if (type === c.WEAPON) {
      itemData.data.damage = c.D6;
      itemData.data.weight = c.REGULAR;
      itemData.data.rateOfFire = c.NONE;
      itemData.data.equippedStatus = c.STORED;
    }

    await this.actor.createOwnedItem(itemData);
    if (type !== c.ABILITY) {
      updateActorForItems(this.actor);
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
    await updateActorForItems(this.actor);
    await updateActorForAbilities(this.actor);
  };

}