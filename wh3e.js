import { wh3e } from './module/config.js';
import WH3ItemSheet from './module/sheets/WH3ItemSheet.js';

Hooks.once("init", function () {
  console.log("wh3e | Initialising Whitehack 3e System");

  CONFIG.wh3e = wh3e;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wh3e", WH3ItemSheet, { makeDefault: true });
})