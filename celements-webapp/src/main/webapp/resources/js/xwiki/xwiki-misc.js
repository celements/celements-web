/** this are js-snippets moved to disk from xwiki-sheets on
 * dropping skinx plugins **/
document.addEventListener('DOMContentLoaded', function () {
  const switcher = document.getElementById('classname');
  if (switcher) {
    switcher.addEventListener('change', function () {
      const value = this.options[this.selectedIndex].value;
      if (value !== '-') {
        window.location = value;
      }
    });
    const form = switcher.closest('form');
    if (form) {
      const submit = form.querySelector("input[type='submit']");
      if (submit) {
        submit.style.display = 'none';
      }
    }
  }
});
