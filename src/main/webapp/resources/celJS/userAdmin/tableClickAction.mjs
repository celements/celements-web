document.querySelectorAll('ul.struct_table_data li.struct_table_row .column_arrow')
            .forEach(arrow => registerListeners(arrow));
            
function registerListeners(arrow){
  const entry = arrow.closest('ul.struct_table_data li.struct_table_row');
  console.log(entry)
  arrow.addEventListener("click", () => {entry.classList.toggle('open')});
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