const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";
const TOKEN_KEY = "opnora_admin_token";

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    function saveToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }

    function loadToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function clearToken() {
        sessionStorage.removeItem(TOKEN_KEY);
    }

    function cleanUrl() {
        history.replaceState(null, "", window.location.pathname);
    }

    function readTokenFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (token) {
            saveToken(token);
            cleanUrl();
            return token;
        }

        if (error) {
            alert("OAuth failed: " + error);
            cleanUrl();
            return null;
        }

        return null;
    }

    async function checkAuth() {
        const token = loadToken();

        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/api/check-auth`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                clearToken();
                return null;
            }

            return data.user;
        } catch (error) {
            clearToken();
            return null;
        }
    }

    async function handleLoginPage() {
        const loginBtn = document.getElementById("githubLogin");

        readTokenFromUrl();

        const user = await checkAuth();

        if (user) {
            window.location.href = "dashboard.html";
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
                <i class="fa-brands fa-github"></i>
                Login with GitHub
            `;

            loginBtn.addEventListener("click", () => {
                loginBtn.disabled = true;
                loginBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Redirecting...
                `;
                window.location.href = `${API_BASE}/auth/login`;
            });
        }
    }

    async function loadProjectCount() {
        const projectCountEl = document.getElementById("projectCount");
        if (!projectCountEl) return;

        try {
            const response = await fetch("../projects.json");
            const projects = await response.json();

            if (Array.isArray(projects)) {
                projectCountEl.textContent = projects.length;
            } else {
                projectCountEl.textContent = "0";
            }
        } catch (error) {
            projectCountEl.textContent = "0";
            console.log("Projects count load error:", error);
        }
    }

    async function handleDashboardPage() {
        const user = await checkAuth();

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        const heading = document.querySelector(".topbar h1");
        if (heading) {
            heading.textContent = `Welcome, ${user.name || user.login}`;
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                clearToken();
                window.location.href = "index.html";
            });
        }

        await loadProjectCount();
    }

    if (currentPage === "index.html" || currentPage === "") {
        handleLoginPage();
    } else if (currentPage === "dashboard.html") {
        handleDashboardPage();
    }
});
