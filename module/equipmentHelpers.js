export const updateEquipmentValues = (actor) => {
  const items = actor.items;
  // Calculate encumbrance
  let encEquipped = 0;
  let encStored = 0;
  let equippedArmour = items.filter(item => item.type === 'Armour' && item.data.data.equippedStatus === 'equipped');
  encEquipped = encEquipped + getEncumbranceForItems(equippedArmour);
  encEquipped = encEquipped + getEncumbranceForItems(items.filter((item) => item.type === 'Weapon' && item.data.data.equippedStatus === 'equipped'));
  encEquipped = encEquipped + getEncumbranceForItems(items.filter((item) => item.type === 'Gear' && item.data.data.equippedStatus === 'equipped'));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === 'Armour' && item.data.data.equippedStatus === 'stored'));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === 'Weapon' && item.data.data.equippedStatus === 'stored'));
  encStored = encStored + getEncumbranceForItems(items.filter((item) => item.type === 'Gear' && item.data.data.equippedStatus === 'stored'));

  // Calculate armour class
  let ac = 0;
  if (equippedArmour.length > 0) {
    ac = getArmourClassForItems(equippedArmour);
  }

  actor.update({
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
    if (item.type == 'Weapon' || item.type === 'Gear') {
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

