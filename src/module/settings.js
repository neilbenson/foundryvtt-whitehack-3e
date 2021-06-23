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
  game.settings.register("whitehack3e", "background", {
    name: game.i18n.localize("wh3e.setting.background"),
    hint: game.i18n.localize("wh3e.setting.backgroundHint"),
    default: "whBackground",
    scope: "world",
    type: String,
    config: true,
    choices: {
      whBackground: "wh3e.setting.whBackground",
      defaultBackground: "wh3e.setting.defaultBackground"
    },
    onChange: (_) => window.location.reload(),
  });
};
