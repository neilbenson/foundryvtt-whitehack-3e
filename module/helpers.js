export const registerHelpers = async function () {

  Handlebars.registerHelper("getTextFromKey", (group, key) => {
    if (key) {
      const languageKey = group + "." + key;
      const languageValue = game.i18n.localize(languageKey);
      return new Handlebars.SafeString(languageValue);
    } else {
      return "";
    }
  });

  Handlebars.registerHelper("showModifier", (key, charClass) => {
    if (key === 'str' && charClass === "theStrong") return true;
    if (key === 'con' && charClass === "theStrong") return true;
    if (key === 'wis' && charClass === "theWise") return true;
    if (key === 'dex' || key === 'int') return true;
    return false;
  });

  Handlebars.registerHelper("stripHtml", (html) => {
    return html.replace(/(<([^>]+)>)/ig, '');
  });

  Handlebars.registerHelper('upper', function (aString) {
    return aString.toUpperCase();
  });

  Handlebars.registerHelper('lower', function (aString) {
    return aString.toLowerCase();
  });

  Handlebars.registerHelper('decimals', function (aNumber) {
    return aNumber.toFixed(2);
  });

  Handlebars.registerHelper('encumbered', function (encumbrance, threshold) {
    return encumbrance > threshold;
  });

}
