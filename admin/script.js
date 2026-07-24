const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";
const TOKEN_KEY = "opnora_admin_token";

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("githubLogin");

    function saveToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }

    function loadToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function clearToken() {
        sessionStorage.removeItem(TOKEN_KEY);
    }

    function readTokenFromHash() {
        const hash = window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : "";

        const params = new URLSearchParams(hash);
        const token = params.get("token");
        const error = params.get("error");

        if (token) {
            saveToken(token);
            history.replaceState(null, "", window.location.pathname);
            return token;
        }

        if (error) {
            alert("OAuth failed: " + error);
            history.replaceState(null, "", window.location.pathname);
        }

        return null;
    }

    async function checkAuth() {
        const token = loadToken();

        if (!token) return false;

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
                return false;
            }

            return true;
        } catch (error) {
            clearToken();
            return false;
        }
    }

    async function initLoginFlow() {
        readTokenFromHash();

        const isAuthenticated = await checkAuth();

        if (isAuthenticated) {
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

    initLoginFlow();
});
