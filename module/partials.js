export const registerPartials = async () => {

  Handlebars.registerPartial('controlsEditDeleteHeader', `
    <th class="item-controls">
      <a class="item-create" data-type="{{type}}" title="{{title}}">
        <i class="fas fa-plus"></i>
      </a>
    </th>
  `);

  Handlebars.registerPartial('controlsEditDelete', `
    <td class= "item-controls" >
      <a class="item-control item-edit" title="{{editTitle}}"><i class="fas fa-edit"></i></a>
      <a class="item-control item-delete" title="{{deleteTitle}}"><i class="fas fa-trash"></i></a>
    </td >
  `);

  Handlebars.registerPartial('controlsEquipStore', `
    <td class="equippable">
      <a class="item-control" title="{{name}} {{lower (localize "wh3e.item.equipped")}} "><i
        class="fas fa-tshirt {{#if (eq status "equipped")}}
        active{{else}}inactive
        {{/if}}"></i></a>
      <a class="item-control" title="{{name}} {{lower (localize "wh3e.item.stored")}}"><i
        class="fas {{#if (eq status "equipped")}}
        fa-box-open inactive{{else}}fa-box active
        {{/if}}"></i></a>
    </td>
  `);

  Handlebars.registerPartial('selectOptions', `
    <select id="{{field}}" name="{{field}}">
      {{#select selected}}
      {{#each options as |name type|}}
      <option value="{{type}}">{{localize name}}</option>
      {{/each}}
      {{/select}}
    </select>
  `);

}