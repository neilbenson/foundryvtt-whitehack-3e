export const registerHelpers = async function () {

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

  Handlebars.registerHelper("stripHtml", (html) => {
    return html.replace(/(<([^>]+)>)/ig, '');
  })

}
