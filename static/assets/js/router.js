/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions related to routing.
let appRoutes = {};

// Initialize router function.
function initializeRouter(e) {
    e.preventDefault();
    let url = window.location.toString().replace(window.location.origin, "").split("?");
    if (url[0] == "/") { url[0] = "/#/"; }
    if (appRoutes[url[0]] == undefined) {
        window.location = "/#/";
        return;
    }
    let urlParameters = {};
    if (url[1] != undefined) {
        // Assign url parameters values.
        let params = url[1].split("&");
        for (let k = 0; k < params.length; k++) {
            let paramsPair = params[k].split("=");
            if (paramsPair.length != 2) { continue; }
            urlParameters[paramsPair[0]] = paramsPair[1];
        }
    }
    // Prepare application.
    document.querySelector(`html`).scrollTop = 0;
    appRoutes[url[0]](urlParameters);
}

// Run router function on page change.
window.addEventListener("load", initializeRouter, false);
window.addEventListener("popstate", initializeRouter, false);
let view = document.getElementById("view_id");

// Home page.
appRoutes["/#/"] = function () {
    if (!isLogged()) { return; }
    view.innerHTML = document.getElementById("homePageTemplate_id").innerHTML;
    document.getElementById("userInfo_id").innerHTML = `<h3 class="text-subtitle mb-0 self-center truncate"><i class="fad fa-envelope icon-primary"></i> ${user.emailAddress}</h3><a class="self-center" href="/#/login">Change</a>`;
    leaveRoom();
    getRooms().then(r => { showRooms(); }).catch(e => { console.log(e); });
}

// Login page.
appRoutes["/#/login"] = function () {
    view.innerHTML = document.getElementById("loginPageTemplate_id").innerHTML;
    leaveRoom();
    setDefault();
}

// Maintainence page.
appRoutes["/#/maintainence"] = function () {
    view.innerHTML = `<center>
    <div class="bg-light max-w-sm p-4">
    <i class="fad fa-window icon-primary fa-4x"></i>
    <h1 class="font-bold" style="font-size: 5rem !important;">500!</h1>
    </div><h1 class="font-bold">Something Missing</h1>
    <h4 class="text-subtitle">Server is down for maintainence</h4>
    </center>`;
    setDefault();
}