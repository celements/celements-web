document.querySelectorAll('ul.struct_table_data li.struct_table_row .column_active')
     .forEach(user => checkIfUserActive(user));

function checkIfUserActive(user){
    var randomBoolean = Math.random() >= 0.5;
    if(randomBoolean){
    //if user is active and not suspended add class active and show icon "fa fa-user"
    user.classList.add('active');
    } else {
    //if user is inactive or suspended add class inactive and show icon "fa fa-ban"
    user.classList.add('inactive');
    }
}
