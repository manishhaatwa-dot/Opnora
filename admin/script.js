const loginBtn = document.getElementById("githubLogin");

loginBtn.addEventListener("click", () => {

loginBtn.disabled = true;

loginBtn.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
Connecting to GitHub...
`;

setTimeout(() => {

window.location.href = "dashboard.html";

},1500);

});