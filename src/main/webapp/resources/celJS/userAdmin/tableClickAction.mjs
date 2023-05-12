document.querySelectorAll('.struct_table_data .struct_table_row').forEach(entry => { 
  entry.addEventListener("click", () => {
     document.querySelectorAll('.struct_table_data .struct_table_row').forEach(e => 
              e.classList.remove('open'));
          entry.classList.add('open');
  }); 
});