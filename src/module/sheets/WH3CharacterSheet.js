import { updateActorGroups, updateActorEncumbrance, updateActorArmourClass } from "../helpers/itemHelpers.js";
import { rollModDialog, attackRollDialog } from "../helpers/diceHelpers.js";
import * as c from "../constants.js";

export default class WH3CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/whitehack3e/templates/sheets/character-sheet.hbs",
      classes: ["wh3e", "sheet", "character"],
      width: c.CHARACTER_SHEET_WIDTH,
      height: c.CHARACTER_SHEET_HEIGHT,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "attributes" }],
      resizable: true,
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /**
   * Fetch Foundry data
   * @returns {Object}
   */
  getData() {
    const data = super.getData();
    const groups = [c.AFFILIATION, c.SPECIES, c.VOCATION];
    let actorData = data.actor;
    
    actorData.config = CONFIG.wh3e;
    actorData.weapons = data.items.filter((item) => item.type === c.WEAPON);
    actorData.gear = data.items.filter((item) => item.type === c.GEAR);
    actorData.abilities = data.items.filter((item) => item.type === c.ABILITY);
    actorData.hasGroups = !!actorData.abilities.filter((item) => {
      return groups.includes(item.type);
    });
    actorData.armour = data.items.filter((item) => item.type === c.ARMOUR);
    if (!actorData.system.basics.species) {
      actorData.system.basics.species = game.settings.get("whitehack3e", "defaultSpecies");
    }
    actorData.charClass = actorData.system.basics.class;
    actorData.hasToken = !(this.token === null);
    actorData.editable = this.options.editable;
    return actorData;
  }

  /**
   * Register event listeners
   * @param {string} html
   */
  activateListeners(html) {
    if (this.isEditable) {
      html.find(".item-create").click(this._itemCreateHandler.bind(this));
      html.find(".item-edit").click(this._itemEditHandler.bind(this));
      html.find(".item-delete").click(this._itemDeleteHandler.bind(this));
      html.find(".attribute-score").change(this._attributeChangeHandler.bind(this));
      html.find(".ability-activated i").click(this._abilityChangeStatusHandler.bind(this));
      html.find(".equippable i").click(this._gearChangeEquippedStatusHandler.bind(this));
      html.find(".manage-groups").click(this._groupsChangeHandler.bind(this));
      html.find(".clear-groups").click(this._groupsDeleteFromAttributeHandler.bind(this));
    }

    // Owner only listeners
    if (this.actor.isOwner) {
      html.find(".item-description").click(this._itemShowInfoHandler.bind(this));
      html.find(".attack-roll").click(this._attackRollHandler.bind(this));
      html.find(".attribute label").click(this._rollHandler.bind(this));
      html.find("label.savingThrow").click(this._rollHandler.bind(this));
      html.find(".init-label").click(this._initiativeRollHandler.bind(this));
    }

    super.activateListeners(html);
  }

  /**
   * Create Item in data and attach to Actor
   * @param {Object} event
   */
  async _itemCreateHandler(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;

    let itemData = {
      img: c.DEFAULTGEARIMAGE,
      name: game.i18n.localize("wh3e.sheet.new" + type),
      type: type,
      data: {
        description: c.EMPTYSTRING,
      },
    };

    if (type === c.ABILITY) {
      itemData.data.activeStatus = c.INACTIVE;
      itemData.img = c.DEFAULTABILITYIMAGE;
    }

    if (type === c.GEAR) {
      itemData.data.weight = c.REGULAR;
      itemData.data.equippedStatus = c.STORED;
    }

    if (type === c.ARMOUR) {
      itemData.data.armourClass = 0;
      itemData.data.equippedStatus = c.STORED;
      itemData.img = c.DEFAULTARMOURIMAGE;
    }

    if (type === c.WEAPON) {
      itemData.data.damage = c.D6;
      itemData.data.weight = c.REGULAR;
      itemData.data.range = 0;
      itemData.data.rateOfFire = c.NONE;
      itemData.data.equippedStatus = c.STORED;
      itemData.data.cost = 0;
      itemData.img = c.DEFAULTWEAPONIMAGE;
    }

    await this.actor.createEmbeddedDocuments("Item", [itemData]);
    if (type !== c.ABILITY) {
      updateActorEncumbrance(this.actor);
    }
  }

  /**
   * Get Item and show item sheet
   * @param {Object} event
   */
  _itemEditHandler(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    const item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  /**
   * Get Item and delete for owner
   * @param {Object} event
   */
  async _itemDeleteHandler(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const itemId = element.closest("tr").dataset.itemId;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    await updateActorEncumbrance(this.actor);
    await updateActorGroups(this.actor);
  }

  /**
   * Set attribute modifiers when attribute changes
   * @param {Object} event
   * @returns
   */
  async _attributeChangeHandler(event) {
    const attrName = event.currentTarget.name.split(".")[2];
    const attrValue = event.currentTarget.value;
    let modObj = { [attrName + c.MOD]: 0 };

    // Set STR modifiers for attack and damage
    if (attrName === c.STR) {
      let strMod = 0,
        dmgMod = 0;
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
              dmgMod: dmgMod,
            },
          },
        },
      });
    } else if (attrName !== c.CHA) {
      modObj = { [attrName + c.MOD]: 0 };
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
              value: attrValue,
            },
          },
        },
      });
    }
  }

  /**
   * Update active status for ability
   * @param {Object} event
   */
  async _abilityChangeStatusHandler(event) {
    const item = this.getItem(event);
    await item.update({
      data: {
        activeStatus: this.updateActiveStatus($(event.currentTarget)),
      },
    });
  }

  /**
   * Update equipped status for gear
   * @param {Object} event
   */
  async _gearChangeEquippedStatusHandler(event) {
    const item = this.getItem(event);

    await item.update({
      system: {
        equippedStatus: this.updateEquippedStatus(item.system.equippedStatus),
      },
    });
    await updateActorEncumbrance(this.actor);
    await updateActorArmourClass(this.actor);
  }

  /**
   * Open dialogue to show selectable groups for attribute
   * @param {Object} event
   */
  _groupsChangeHandler(event) {
    this.actor.manageGroupsDialog(event.currentTarget.dataset.groupsFor);
  }

  /**
   * Remove groups from attribute
   * @param {Object} event
   */
  _groupsDeleteFromAttributeHandler(event) {
    this.actor.clearGroupsDialog(event.currentTarget.dataset.groupsFor);
  }

  /**
   * Show information on Item in chat
   * @param {Object} event
   */
  _itemShowInfoHandler(event) {
    const item = this.getItem(event);
    item.sendInfoToChat();
  }

  /**
   * Get item (weapon) and send to dialog for attack roll
   * @param {Object} event
   */
  _attackRollHandler(event) {
    const item = this.getItem(event);
    attackRollDialog(item);
  }

  /**
   * Determine if saving throw or attribute roll and send to dialog for roll
   * @param {Object} event
   */
  _rollHandler(event) {
    const rollAttribute = event.currentTarget.dataset.rollFor;
    const rollTitle =
      rollAttribute === c.SAVINGTHROW
        ? game.i18n.localize("wh3e.sheet.savingThrow")
        : rollAttribute.toUpperCase() + " " + game.i18n.localize("wh3e.sheet.taskRoll");
    rollModDialog(this.actor, rollAttribute, rollTitle);
  }

  /**
   * Initiate rollInitiative method on actor
   * @param {Object} event
   */
  _initiativeRollHandler(event) {
    event.preventDefault();
    this.actor.rollInitiative(this.token);
  }

  /**
   * When item is dropped on actor sheet update items for actor
   * @param {Object} event
   */
  async _onDrop(event) {
    await super._onDrop(event);
    await updateActorEncumbrance(this.actor);
    await updateActorGroups(this.actor);
  }

  /**
   * Get item for event based on table
   * @param {Object} event
   * @returns {Object}
   */
  getItem(event) {
    const itemId = event.currentTarget.closest("tr").dataset.itemId;
    return this.actor.items.get(itemId);
  }

  /**
   * Toggle equipped status
   * @param {string} equippedStatus
   * @returns {string}
   */
  updateEquippedStatus(equippedStatus) {
    if (equippedStatus === c.STORED) {
      return c.EQUIPPED;
    } else {
      return c.STORED;
    }
  }

  /**
   * Toggle active status for icon
   * @param {Object} icon
   * @returns {string}
   */
  updateActiveStatus(icon) {
    if (icon.hasClass(c.INACTIVE)) {
      return c.ACTIVE;
    } else {
      return c.INACTIVE;
    }
  }
}
