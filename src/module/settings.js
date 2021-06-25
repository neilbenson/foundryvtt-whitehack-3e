export const registerSettings = function () {
  game.settings.register("whitehack3e", "defaultSpecies", {
    name: game.i18n.localize("wh3e.setting.defaultSpecies"),
    hint: game.i18n.localize("wh3e.setting.defaultSpeciesHint"),
    default: "Human",
    scope: "world",
    type: String,
    config: true,
    onChange: (_) => window.location.reload(),
  });
  game.settings.register("whitehack3e", "itemsEquippedLimit", {
    name: game.i18n.localize("wh3e.setting.itemsEquippedLimit"),
    hint: game.i18n.localize("wh3e.setting.itemsEquippedLimitHint"),
    default: 10,
    scope: "world",
    type: Number,
    config: true,
    onChange: (_) => window.location.reload(),
  });
  game.settings.register("whitehack3e", "itemsStoredLimit", {
    name: game.i18n.localize("wh3e.setting.itemsStoredLimit"),
    hint: game.i18n.localize("wh3e.setting.itemsStoredLimitHint"),
    default: 5,
    scope: "world",
    type: Number,
    config: true,
    onChange: (_) => window.location.reload(),
  });
};
