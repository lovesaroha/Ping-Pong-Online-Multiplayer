/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All helper functions.
// Color themes defined here.
const themes = [
  {
      normal: "#5468e7",
      dark: "#4c5ed0",
      light: "#6577e9",
      veryLight: "#eef0fd",
      primaryText: "#ffffff",
      iconSecondary: "#FFD43B"
  }, {
      normal: "#e94c2b",
      dark: "#d24427",
      veryLight: "#fdedea",
      light: "#eb5e40",
      primaryText: "#ffffff",
      iconSecondary: "#FFD43B"
  }
];

// Choose random color theme.
let colorTheme = themes[Math.floor(Math.random() * themes.length)];

// This function set random color theme.
function setTheme() {
  // Change css values.
  document.documentElement.style.setProperty("--primary", colorTheme.normal);
  document.documentElement.style.setProperty("--icon-secondary", colorTheme.iconSecondary);
}

// Set random theme.
setTheme();

// This function checks if email is valid or not.
function isEmail(string) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (emailRegexp.test(string) == false) {
      return false;
  }
  return true;
}

// This is a showModal function which shows modal based on given options as an argument.  
function showModal(content) {
  let modal = document.getElementById("modal_id");
  if (modal == null) { return; }
  modal.style = "display: block;";
  modal.innerHTML = content;
}

// This is closeModal function which closes modal and remove backdrop from body.
function closeModal() {
  let modal = document.getElementById("modal_id");
  if (modal == null) { return; }
  modal.style = "display: none;";
  modal.innerHTML = ``;
}

// This is closeModal background function which closes modal.
function closeModalBackground(e) {
  if (e.target.id != "modal_id") { return; }
  let modal = document.getElementById("modal_id");
  if (modal == null) { return; }
  modal.style = "display: none;";
  modal.innerHTML = ``;
}
