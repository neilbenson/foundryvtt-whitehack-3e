export const registerPartials = async function () {

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

}