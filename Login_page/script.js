document.getElementById("loginform").addEventListener("submit", function(event) {

    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let message = document.getElementById("message");

    if(password == "" || username == ""){
        message.innerText = "Enter the username and password";
    }
    else if(password == "shivam" && username == "123" ){
        message.innerText = "Log in succesfull"
    }else{
        message.innerText = "Add correct credentials";

    }
});