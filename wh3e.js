import { wh3e } from './module/config.js';
import WH3Item from './module/WH3Item.js';
import WH3ItemSheet from './module/sheets/WH3ItemSheet.js';
import WH3CharacterSheet from './module/sheets/WH3CharacterSheet.js';
import WH3MonsterSheet from './module/sheets/WH3MonsterSheet.js';
import WH3Actor from './module/WH3Actor.js';
import { registerHelpers } from "./module/helpers.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/wh3e/templates/partials/character-header.hbs",
    "systems/wh3e/templates/partials/character-stats.hbs",
    "systems/wh3e/templates/partials/ability-info.hbs",
    "systems/wh3e/templates/partials/weapon-info.hbs",
    "systems/wh3e/templates/partials/gear-info.hbs",
    "templates/dice/roll.html"
  ];

  return loadTemplates(templatePaths);
}

Hooks.once("init", () => {
  console.log("wh3e | Initialising Whitehack 3e System");

  CONFIG.wh3e = wh3e;

  CONFIG.Item.entityClass = WH3Item;
  CONFIG.Actor.entityClass = WH3Actor;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wh3e", WH3ItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wh3e", WH3CharacterSheet, { makeDefault: true, types: ['Character'] });
  Actors.registerSheet("wh3e", WH3MonsterSheet, { makeDefault: true, types: ['Monster'] });

  preloadHandlebarsTemplates();

  registerHelpers();
});