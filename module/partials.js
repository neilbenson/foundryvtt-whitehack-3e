export const registerPartials = async function () {

  Handlebars.registerPartial('itemControlsHeader', `
    <th class="item-controls">
      <a class="item-create" data-type="{{type}}" title="{{title}}">
        <i class="fas fa-plus"></i>
      </a>
    </th>
  `);

  Handlebars.registerPartial('itemControls', `
    <td class= "item-controls" >
      <a class="item-control item-edit" title="Edit Item"><i class="fas fa-edit"></i></a>
      <a class="item-control item-delete" title="Delete Item"><i class="fas fa-trash"></i></a>
    </td >
  `);

}