(() => {
  const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";
  const AUTH_URL = `${API_BASE}/api/check-auth`;
  const LOGOUT_URL = `${API_BASE}/api/logout`;
  const PROJECTS_URL = "/projects.json";
  const LOGIN_URL = "./index.html";

  const logoutBtn = document.getElementById("logoutBtn");
  const projectCountEl = document.getElementById("projectCount");
  const topbarTitleEl = document.querySelector(".topbar h1");

  function redirectToLogin() {
    window.location.replace(LOGIN_URL);
  }

  function setWelcome(username) {
    if (topbarTitleEl) {
      topbarTitleEl.textContent = `Welcome, ${username || "Admin"}`;
    }
  }

  function setProjectCount(count) {
    if (projectCountEl) {
      projectCountEl.textContent = String(count);
    }
  }

  async function checkAuth() {
    const response = await fetch(AUTH_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    const data = await response.json();

    if (!data || data.loggedIn !== true) {
      throw new Error("Not logged in");
    }

    return data;
  }

  async function loadProjects() {
    try {
      const response = await fetch(PROJECTS_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        setProjectCount(0);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProjectCount(data.length);
        return;
      }

      if (Array.isArray(data.projects)) {
        setProjectCount(data.projects.length);
        return;
      }

      if (typeof data.total === "number") {
        setProjectCount(data.total);
        return;
      }

      setProjectCount(0);
    } catch {
      setProjectCount(0);
    }
  }

  async function logout() {
    try {
      await fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });
    } catch (_) {}

    redirectToLogin();
  }

  async function init() {
    try {
      const authData = await checkAuth();
      setWelcome(authData.user);
      await loadProjects();
    } catch {
      redirectToLogin();
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
