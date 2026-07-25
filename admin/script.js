const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";

const githubLoginBtn = document.getElementById("githubLogin");
const logoutBtn = document.getElementById("logoutBtn");

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const projectCount = document.getElementById("projectCount");
const topbarTitle = document.querySelector(".topbar h1");

async function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

function showLogin() {
  if (loginSection) loginSection.style.display = "flex";
  if (dashboardSection) dashboardSection.style.display = "none";
}

function showDashboard() {
  if (loginSection) loginSection.style.display = "none";
  if (dashboardSection) dashboardSection.style.display = "block";
}

function setUserUI(user) {
  if (topbarTitle) {
    const name = (user && (user.name || user.login)) ? (user.name || user.login) : "Admin";
    topbarTitle.textContent = `Welcome, ${name}`;
  }

  if (projectCount) {
    projectCount.textContent = "12";
  }
}

function getQueryError() {
  const params = new URLSearchParams(window.location.search);
  return params.get("error");
}

function clearQueryParams() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

async function checkAuth() {
  try {
    const res = await apiFetch("/api/check-auth", { method: "GET" });
    const data = await res.json();

    if (!res.ok || !data.authenticated) {
      showLogin();
      return;
    }

    setUserUI(data.user);
    showDashboard();
  } catch (err) {
    showLogin();
  }
}

function loginWithGitHub() {
  window.location.href = `${API_BASE}/auth/login`;
}

async function logout() {
  try {
    await apiFetch("/api/logout", { method: "POST" });
  } catch (err) {
  } finally {
    showLogin();
    clearQueryParams();
    window.location.href = "/admin/";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const error = getQueryError();

  if (error) {
    alert("Login failed: " + error);
    clearQueryParams();
  }

  if (githubLoginBtn) {
    githubLoginBtn.addEventListener("click", loginWithGitHub);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  checkAuth();
});
