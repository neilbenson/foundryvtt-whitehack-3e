export default class WH3ItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 350,
      classes: ["wh3e", "sheet", "item"],
      resizable: false
    })
  }

  get template() {
    return `systems/wh3e/templates/sheets/${this.item.data.type}-sheet.hbs`;
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.wh3e;
    return data;
  }
}