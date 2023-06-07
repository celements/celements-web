document.querySelectorAll('ul.struct_table_data li.struct_table_row .column_arrow')
     .forEach(arrow => arrow.addEventListener("click", () => openCloseTableRow(arrow)));
     
function openCloseTableRow(arrow) {
  const entry = arrow.closest('ul.struct_table_data li.struct_table_row');
  entry.classList.toggle('open');
}
