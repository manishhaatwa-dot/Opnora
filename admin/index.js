(() => {
  const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";
  const AUTH_URL = `${API_BASE}/api/check-auth`;
  const LOGIN_URL = `${API_BASE}/auth/login`;

  const loginBtn = document.getElementById("githubLogin");
  const loginStatus = document.getElementById("loginStatus");

  function setStatus(message) {
    if (loginStatus) {
      loginStatus.textContent = message;
    }
  }

  function redirectToDashboard() {
    window.location.replace("./dashboard.html");
  }

  function redirectToLogin() {
    window.location.replace(LOGIN_URL);
  }

  async function checkAuth() {
    const response = await fetch(AUTH_URL, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json"
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

    try {
      const auth = await checkAuth();

      if (auth && auth.loggedIn === true) {
        setStatus("Login detected. Redirecting...");
        redirectToDashboard();
        return;
      }

      setStatus("Please sign in with GitHub to continue.");
    } catch (error) {
      setStatus("Unable to verify login. Please try again.");
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        setStatus("Redirecting to GitHub...");
        redirectToLogin();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
