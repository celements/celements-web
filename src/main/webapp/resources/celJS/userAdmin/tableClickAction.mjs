const entry = document.querySelector('.struct_table_row');

entry.addEventListener("focus", () => {
  entry.classList.toggle('open');
});

entry.addEventListener("blur", () => {
  entry.classList.remove('open');
});