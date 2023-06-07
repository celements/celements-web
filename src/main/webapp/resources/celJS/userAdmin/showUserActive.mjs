document.querySelectorAll('ul.struct_table_data li.struct_table_row .column_active i.fa')
     .forEach(icon => checkIfUserActive(icon));

function checkIfUserActive(user){
    var randomBoolean = Math.random() >= 0.5;
    if(randomBoolean){
    //if user is active and not suspended show icon "fa fa-user"
    icon.classList.add('fa-user');
    } else {
    //if user is inactive or suspended show icon "fa fa-ban"
    icon.classList.add('fa-ban');
    }
}
