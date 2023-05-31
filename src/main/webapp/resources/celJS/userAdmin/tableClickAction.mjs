document.querySelectorAll('ul.struct_table_data > li.struct_table_row')
            .forEach(entry => registerListeners(entry));

function registerListeners(entry){
  entry.addEventListener("mouseover", () => {entry.classList.add('open')});
  entry.addEventListener("mouseout", () => {entry.classList.remove('open')});
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