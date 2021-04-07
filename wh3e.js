import { wh3e } from './module/config.js';
import WH3ItemSheet from './module/sheets/WH3ItemSheet.js';
import WH3CharacterSheet from './module/sheets/WH3CharacterSheet.js';
import WH3MonsterSheet from './module/sheets/WH3MonsterSheet.js';

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/wh3e/templates/partials/character-header.hbs",
    "systems/wh3e/templates/partials/character-stats.hbs",
    "systems/wh3e/templates/partials/ability-info.hbs",
    "systems/wh3e/templates/partials/weapon-info.hbs",
    "systems/wh3e/templates/partials/gear-info.hbs"
  ];

  return loadTemplates(templatePaths);
}

Hooks.once("init", function () {
  console.log("wh3e | Initialising Whitehack 3e System");

  CONFIG.wh3e = wh3e;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wh3e", WH3ItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wh3e", WH3CharacterSheet, { makeDefault: true, types: ['Character'] });
  Actors.registerSheet("wh3e", WH3MonsterSheet, { makeDefault: true, types: ['Monster'] });

  preloadHandlebarsTemplates();

  Handlebars.registerHelper("getTextFromKey", (group, key) => {
    const languageKey = group + "." + key;
    const languageValue = game.i18n.localize(languageKey);
    return new Handlebars.SafeString(languageValue);
  });

  Handlebars.registerHelper("showModifier", (key) => {
    const showArrayFor = ['str', 'dex', 'con'];
    return showArrayFor.find(element => element === key);
  })

  Handlebars.registerHelper("readOnly", (key) => {
    const showArrayFor = ['dex'];
    return showArrayFor.find(element => element === key);
  })
})