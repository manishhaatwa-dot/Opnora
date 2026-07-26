(() => {

const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";

const AUTH_URL = `${API_BASE}/api/check-auth`;
const PROJECTS_URL = "/projects.json";

const table = document.getElementById("projectsTable");
const logoutBtn = document.getElementById("logoutBtn");

async function checkAuth() {

    const res = await fetch(AUTH_URL, {
        credentials: "include",
        cache: "no-store"
    });

    if (!res.ok) {
        window.location.replace("./index.html");
        return false;
    }

    const data = await res.json();

    if (!data.loggedIn) {
        window.location.replace("./index.html");
        return false;
    }

    return true;
}

async function loadProjects() {

    try {

        const res = await fetch(PROJECTS_URL, {
            cache: "no-store"
        });

        if (!res.ok) {
            table.innerHTML = `
            <tr>
                <td colspan="4" align="center">
                    Unable to load projects
                </td>
            </tr>`;
            return;
        }

        const data = await res.json();

        const projects = Array.isArray(data)
            ? data
            : (data.projects || []);

        if (projects.length === 0) {

            table.innerHTML = `
            <tr>
                <td colspan="4" align="center">
                    No Projects Found
                </td>
            </tr>`;

            return;
        }

        table.innerHTML = "";

        projects.forEach((project,index)=>{

            table.innerHTML += `

<tr>

<td>${project.title || project.name || "-"}</td>

<td>${project.category || "-"}</td>

<td align="center">
${project.live ? "Live" : "Draft"}
</td>

<td align="center">

<button onclick="location.href='edit-project.html?id=${index}'">
Edit
</button>

<button onclick="alert('Delete feature coming next')">
Delete
</button>

</td>

</tr>

`;

        });

    } catch (e) {

        table.innerHTML = `
        <tr>
            <td colspan="4" align="center">
                Error loading projects
            </td>
        </tr>`;

    }

}

if(logoutBtn){

logoutBtn.onclick=()=>{

window.location.replace("./index.html");

};

}

document.addEventListener("DOMContentLoaded",async()=>{

const ok=await checkAuth();

if(ok){

loadProjects();

}

});

})();
