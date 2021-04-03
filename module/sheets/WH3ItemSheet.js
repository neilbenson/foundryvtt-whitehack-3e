export default class WH3ItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 400,
      classes: ["wh3e", "sheet", "item"]
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