import * as c from '../constants.js';

export const registerHelpers = async () => {

  Handlebars.registerHelper("getTextFromKey", (group, key, postfix) => {
    if (key) {
      postfix = typeof postfix === c.STRING ? postfix : c.EMPTYSTRING;
      const languageKey = group + "." + key + postfix;
      const languageValue = game.i18n.localize(languageKey);
      return new Handlebars.SafeString(languageValue);
    } else {
      return c.EMPTYSTRING;
    }
  });

  Handlebars.registerHelper("showModifier", (key, charClass) => {
    if (key === c.STR && charClass === c.THESTRONG) return true;
    if (key === c.CON && charClass === c.THESTRONG) return true;
    if (key === c.WIS && charClass === c.THEWISE) return true;
    if (key === c.DEX || key === c.INT) return true;
    return false;
  });

  Handlebars.registerHelper("stripHtml", html => {
    return html.replace(/(<([^>]+)>)/ig, c.EMPTYSTRING);
  });

  Handlebars.registerHelper('upper', aString => {
    return aString.toUpperCase();
  });

  Handlebars.registerHelper('lower', aString => {
    return aString.toLowerCase();
  });

  Handlebars.registerHelper('decimals', aNumber => {
    return aNumber.toFixed(2);
  });

  Handlebars.registerHelper('encumbered', (encumbrance, threshold) => {
    return encumbrance > threshold;
  });

}
