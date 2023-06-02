document.querySelectorAll('ul.struct_table_data li.struct_table_row .column_arrow')
     .forEach(arrow => arrow.addEventListener("click", () => openCloseTableRow(arrow)));
     
function openCloseTableRow(arrow) {
  const entry = arrow.closest('ul.struct_table_data li.struct_table_row');
  entry.classList.toggle('open');
  if (entry.classList.contains('open')) {
    arrow.innerHTML = '<i class="fa fa-caret-down"></i>';
  } else {
    arrow.innerHTML = '<i class="fa fa-caret-right"></i>';
  }
}

/* Tipp von Marc: click Event registrieren auf Body. bei jedem Klick den DOMTree hochgehen und prüfen, 
ob der Klick auf "meinem" Element ist. Wenn nicht, schliesse das Element. 
Alternative: Pfeil-Button zum Klicken, analog Mock-Filebase
*/

/*document.querySelectorAll('.struct_table_data .struct_table_row').forEach(entry => { 
  entry.addEventListener("click", () => {
     document.querySelectorAll('.struct_table_data .struct_table_row').forEach(e => 
              e.classList.remove('open'));
          entry.classList.add('open');
  }); 
});*/
