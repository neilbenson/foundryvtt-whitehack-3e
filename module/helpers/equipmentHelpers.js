import * as c from '../constants.js';

export const updateActorForItems = async (actor) => {
  const items = actor.items;
  // Calculate encumbrance
  let encEquipped = 0;
  let encStored = 0;
  let equippedArmour = items.filter(item => item.type === c.ARMOUR && item.data.data.equippedStatus === c.EQUIPPED);
  encEquipped = encEquipped + getEncumbranceForItems(equippedArmour);
  encEquipped = encEquipped + getEncumbranceForItems(items.filter(item => item.type === c.WEAPON && item.data.data.equippedStatus === c.EQUIPPED));
  encEquipped = encEquipped + getEncumbranceForItems(items.filter(item => item.type === c.GEAR && item.data.data.equippedStatus === c.EQUIPPED));
  encStored = encStored + getEncumbranceForItems(items.filter(item => item.type === c.ARMOUR && item.data.data.equippedStatus === c.STORED));
  encStored = encStored + getEncumbranceForItems(items.filter(item => item.type === c.WEAPON && item.data.data.equippedStatus === c.STORED));
  encStored = encStored + getEncumbranceForItems(items.filter(item => item.type === c.GEAR && item.data.data.equippedStatus === c.STORED));

  // Calculate armour class
  let ac = 0;
  if (equippedArmour.length > 0) {
    ac = getArmourClassForItems(equippedArmour);
  }

  await actor.update({
    data: {
      encumbrance: {
        equipped: encEquipped,
        stored: encStored
      },
      combat: {
        armourClass: ac
      }
    }
  });
};

export const updateActorForAbilities = async (actor) => {
  const items = actor.items;

  // Get vocation and species
  const speciesObj = items.filter(item => {
    return item.type === c.ABILITY && item.data.data.type === c.SPECIES && item.data.data.activeStatus === c.ACTIVE;
  });
  const vocationObj = items.filter(item => item.type === c.ABILITY && item.data.data.type === c.VOCATION);
  const species = speciesObj.length > 0 ? speciesObj[0].name : c.EMPTYSTRING;
  const vocation = vocationObj.length > 0 ? vocationObj[0].name : c.EMPTYSTRING;

  await actor.update({
    data: {
      basics: {
        vocation: vocation,
        species: species
      }
    }
  });
};

const getArmourClassForItems = (items) => {
  let maxAc = 0;
  let shieldHelmAc = 0;
  items.forEach(item => {
    let tempAc = item.data.data.armourClass;
    if (tempAc === c.PLUSONE) {
      shieldHelmAc = 1;
    } else if (tempAc !== c.SPECIAL) {
      tempAc = +tempAc;
      maxAc = tempAc > maxAc ? tempAc : maxAc;
    }
  })
  return maxAc + shieldHelmAc;
};

const getEncumbranceForItems = (items) => {
  let encCount = 0;
  items.forEach(item => {
    if (item.type == c.WEAPON || item.type === c.GEAR) {
      const quantity = item.data.data.quantity === undefined ? 1 : item.data.data.quantity;
      switch (item.data.data.weight) {
        case c.REGULAR:
          encCount = encCount + quantity;
          break;
        case c.HEAVY:
          encCount = encCount + (quantity * 2);
          break;
        case c.MINOR:
          encCount = encCount + (quantity / 2);
          break;
        case c.SMALL:
          encCount = encCount + (quantity / 100);
          break;
        default:
          encCount = encCount++;
      }
    } else {
      if (item.data.data.armourClass !== c.SPECIAL && item.data.data.armourClass !== c.PLUSONE) {
        encCount = encCount + +item.data.data.armourClass
      } else {
        encCount = encCount + 1;
      }
    }
  });
  return encCount;
};

