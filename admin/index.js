(() => {
  const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";
  const AUTH_URL = `${API_BASE}/api/check-auth`;
  const LOGIN_URL = `${API_BASE}/auth/login`;

  const loginBtn = document.getElementById("loginBtn");
  const loginStatus = document.getElementById("loginStatus");

  function setStatus(message) {
    if (loginStatus) {
      loginStatus.textContent = message;
    }
  }

  function goToDashboard() {
    window.location.href = "./dashboard.html";
  }

  function goToLogin() {
    window.location.href = LOGIN_URL;
  }

  async function checkAuth() {
    const response = await fetch(AUTH_URL, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || data.loggedIn !== true) {
      return null;
    }

    return data;
  }

  async function init() {
    setStatus("Checking login status...");

    const auth = await checkAuth();

    if (auth && auth.loggedIn === true) {
      setStatus("Login detected. Redirecting...");
      goToDashboard();
      return;
    }

    setStatus("Please login to continue.");

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        setStatus("Redirecting to GitHub...");
        goToLogin();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
