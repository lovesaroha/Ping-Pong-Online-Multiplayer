/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions related to user.
// User and default variables defined.
let user = { emailAddress: "", socket: { id: 0 } };

// Get user email from local storage.
if (localStorage.getItem("user-data") != null) {
  user.emailAddress = JSON.parse(localStorage.getItem("user-data")).emailAddress;
}

// Connect to server.
user.socket = io({
  reconnectionAttempts: 2
});

// If reconnect failed.
user.socket.io.on("reconnect_failed", () => {
  window.location = "/#/maintainence";
});

// Check if user is logged.
function isLogged() {
  if (!isEmail(user.emailAddress)) {
    // User not logged in.
    window.location = "/#/login";
    return false;
  }
  return true;
}

// User sign in function to register user's email address.
function signIn(e) {
  e.preventDefault();
  user.emailAddress = e.target.emailAddress.value;
  localStorage.setItem("user-data", JSON.stringify({ emailAddress: user.emailAddress }));
  window.location = '/#/';
}