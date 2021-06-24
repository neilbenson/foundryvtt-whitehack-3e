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
};
