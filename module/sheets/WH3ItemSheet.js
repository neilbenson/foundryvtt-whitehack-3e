export default class WH3ItemSheet extends ItemSheet {
  get template() {
    return `systems/wh3e/templates/sheets/${this.item.data.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.wh3e;

    return data;
  }
}