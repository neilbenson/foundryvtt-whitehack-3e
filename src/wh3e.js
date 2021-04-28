import { wh3e } from './module/config.js';
import WH3Item from './module/WH3Item.js';
import WH3ItemSheet from './module/sheets/WH3ItemSheet.js';
import WH3CharacterSheet from './module/sheets/WH3CharacterSheet.js';
import WH3MonsterSheet from './module/sheets/WH3MonsterSheet.js';
import WH3Actor from './module/WH3Actor.js';
import { registerHelpers } from "./module/helpers/handleBarsHelpers.js";
import { registerPartials } from './module/partials.js';
import * as c from './module/constants.js'; // c = constants

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/wh3e/templates/partials/character-header.hbs",
    "systems/wh3e/templates/partials/character-stats.hbs",
    "systems/wh3e/templates/partials/ability-info.hbs",
    "systems/wh3e/templates/partials/weapon-info.hbs",
    "systems/wh3e/templates/partials/gear-info.hbs",
    "systems/wh3e/templates/partials/armour-info.hbs",
    "systems/wh3e/templates/partials/notes-tab.hbs",
    "systems/wh3e/templates/chat/partials/roll-results.hbs"
  ];

  return loadTemplates(templatePaths);
}

/**
 * FoundryVTT hooks
 */
Hooks.once("init", () => {
  console.log("wh3e | Initialising Whitehack 3e System");

  CONFIG.wh3e = wh3e;

  CONFIG.Item.entityClass = WH3Item;
  CONFIG.Actor.entityClass = WH3Actor;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wh3e", WH3ItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wh3e", WH3CharacterSheet, { makeDefault: true, types: [c.CHARACTER] });
  Actors.registerSheet("wh3e", WH3MonsterSheet, { makeDefault: true, types: [c.MONSTER] });

  preloadHandlebarsTemplates();

  registerHelpers();
  registerPartials();
});

// License and KOFI infos
Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof Settings) {
    let gamesystem = html.find("#game-details");

    // License text
    const template = "systems/wh3e/templates/license.hbs";
    const rendered = await renderTemplate(template);
    gamesystem.find(".system").append(rendered);

    // User guide
    let docs = html.find("button[data-action='docs']");
    const styling = "border:none;margin-right:2px;vertical-align:middle;margin-bottom:5px";
    $(`<button data-action="userguide"><img src='/systems/owb/assets/default/ability.png' width='16' height='16' style='${styling}'/>WWII:OWB Guide</button>`).insertAfter(docs);
    html.find('button[data-action="userguide"]').click(ev => {
      new FrameViewer('https://chrisesharp.github.io/foundryvtt-owb', { resizable: true }).render(true);
    });
  }
});