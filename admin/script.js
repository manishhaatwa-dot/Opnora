const loginBtn = document.getElementById("githubLogin");

loginBtn.addEventListener("click", () => {
    // 1. User se GitHub Personal Access Token (PAT) maangein
    const token = prompt("Please enter your GitHub Personal Access Token (PAT):");

    if (!token) {
        alert("Login cancel ho gaya. Token daalna zaroori hai!");
        return;
    }

    // 2. Button par loading state dikhayein
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Connecting to GitHub...
    `;

    // 3. Token ko browser ki memory (localStorage) me safe save karein
    localStorage.setItem('gh_token', token);

    // 4. Token save hone ke baad dashboard par bhej dein
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1500);
});
