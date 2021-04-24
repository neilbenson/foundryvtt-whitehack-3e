import * as c from '../constants.js';

export const updateActorForItems = async (actor) => {
  const items = actor.items;
  // Calculate encumbrance
  let encEquipped = 0;
  let encStored = 0;
  let equippedArmour = items.filter(item => item.type === c.ARMOUR && item.data.data.equippedStatus === c.EQUIPPED);
  encEquipped = encEquipped + getEncumbranceForItems(equippedArmour);
  encEquipped = encEquipped + getEncumbranceForItems(items.filter((item) => item.type === c.WEAPON && item.data.data.equippedStatus === c.EQUIPPED));
  encEquipped = encEquipped + getEncumbranceForItems(items.filter((item) => item.type === c.GEAR && item.data.data.equippedStatus === c.EQUIPPED));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === c.ARMOUR && item.data.data.equippedStatus === c.STORED));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === c.WEAPON && item.data.data.equippedStatus === c.STORED));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === c.GEAR && item.data.data.equippedStatus === c.STORED));

  // Get vocation and species
  const speciesObj = items.filter((item) => item.type === c.ABILITY && item.data.data.type === "species");
  const vocationObj = items.filter((item) => item.type === c.ABILITY && item.data.data.type === "vocation");
  const species = speciesObj.length > 0 ? speciesObj[0].name : "";
  const vocation = vocationObj.length > 0 ? vocationObj[0].name : "";

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
      },
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
    if (tempAc === 'plusOne') {
      shieldHelmAc = 1;
    } else if (tempAc !== 'special') {
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
        case 'regular':
          encCount = encCount + quantity;
          break;
        case 'heavy':
          encCount = encCount + (quantity * 2);
          break;
        case 'minor':
          encCount = encCount + (quantity / 2);
          break;
        case 'small':
          encCount = encCount + (quantity / 100);
          break;
        default:
          encCount = encCount++;
      }
    } else {
      if (item.data.data.armourClass !== 'special' && item.data.data.armourClass !== 'plusOne') {
        encCount = encCount + +item.data.data.armourClass
      } else {
        encCount = encCount + 1;
      }
    }
  });
  return encCount;
};

