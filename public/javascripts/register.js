/*function validate() {
    var x = document.forms["indexForm"]["username"].value;
    if (x == null || x == "") {
        alert("Name must be filled out");
        return false;
    }

     var y = document.forms["indexForm"]["password"].value;
    if (y == null || y == "") {
        alert("Password must be filled out");
        return false;
    }
}*/

$(document).ready(function(){
    $("#submitRegistration").click(function(){
        $("username").hide();
        $("password").hide();
    });
});