/** this are js-snippets moved to disk from xwiki-sheets on
 * dropping skinx plugins **/
document.observe('dom:loaded', function () {
    var switcher = $('classname');
    if (typeof (switcher) != 'undefined') {
        switcher.observe('change', function () {
            var value = this.options[this.selectedIndex].value;
            if (value != '-') {
                window.self.location = value;
            }
        }.bindAsEventListener(switcher));
        switcher.up('form').down("input[type='submit']").hide();
    }
});


