import * as c from "../constants.js";

export const registerHelpers = async () => {
  /**
   * Get string from language file based on partial path (group), key and postfix
   */
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

  /**
   * Determine which modifier to show based on attribute and class
   */
  Handlebars.registerHelper("showModifier", (key, charClass) => {
    if (key === c.STR && charClass === c.THESTRONG) return true;
    if (key === c.CON && charClass === c.THESTRONG) return true;
    if (key === c.WIS && charClass === c.THEWISE) return true;
    if (key === c.DEX || key === c.INT) return true;
    return false;
  });

  /**
   * Is abilityType a group
   */
  Handlebars.registerHelper("isGroup", (abilityType) => {
    return [c.AFFILIATION, c.SPECIES, c.VOCATION].includes(abilityType);
  });

  Handlebars.registerHelper("getBurdenCategory", (equipped, stored) => {
    const totalEncumbrance = equipped + stored;
    if (totalEncumbrance <= 15) {
      return game.i18n.localize("wh3e.burdenCategory.normal");
    } else if (totalEncumbrance <= 30) {
      return game.i18n.localize("wh3e.burdenCategory.heavy");
    } else if (totalEncumbrance <= 45) {
      return game.i18n.localize("wh3e.burdenCategory.severe");
    } else if (totalEncumbrance <= 60) {
      return game.i18n.localize("wh3e.burdenCategory.massive");
    } else {
      return game.i18n.localize("wh3e.burdenCategory.tooMuch");
    }
  });

  Handlebars.registerHelper("stripHtml", (html) => {
    return html.replace(/(<([^>]+)>)/gi, c.EMPTYSTRING);
  });

  Handlebars.registerHelper("upper", (aString) => {
    return aString.toUpperCase();
  });

  Handlebars.registerHelper("lower", (aString) => {
    return aString.toLowerCase();
  });

  Handlebars.registerHelper("decimals", (aNumber) => {
    return aNumber.toFixed(2);
  });

  Handlebars.registerHelper("encumbered", (encumbrance, threshold) => {
    return encumbrance > threshold;
  });

  Handlebars.registerHelper("hasEncumbrance", (gear) => {
    return gear !== c.NOENCUMBRANCE;
  });
};
