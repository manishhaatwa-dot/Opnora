(() => {

const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";

const AUTH_URL = `${API_BASE}/api/check-auth`;
const PROJECTS_API = `${API_BASE}/api/projects`;
const PROJECTS_URL = "/projects.json";

const table = document.getElementById("projectsTable");
const logoutBtn = document.getElementById("logoutBtn");

let currentProjects = [];

async function checkAuth(){

    const response = await fetch(AUTH_URL,{
        credentials:"include",
        cache:"no-store"
    });

    if(!response.ok){

        window.location.replace("./index.html");
        return false;

    }

    const data = await response.json();

    if(!data.loggedIn){

        window.location.replace("./index.html");
        return false;

    }

    return true;

}

async function loadProjects(){

    const response = await fetch(PROJECTS_URL,{
        cache:"no-store"
    });

    if(!response.ok){

        throw new Error("Unable to load projects");

    }

    const data = await response.json();

    currentProjects = Array.isArray(data)
        ? data
        : (data.projects || []);
    }
function renderProjects(){

    if(currentProjects.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="4" align="center">
                No Projects Found
            </td>
        </tr>`;

        return;

    }

    table.innerHTML = "";

    currentProjects.forEach((project,index)=>{

        const status = project.live ? "Live" : "Draft";

        table.innerHTML += `
<tr>

<td>${project.title || "-"}</td>

<td>${project.category || "-"}</td>

<td align="center">${status}</td>

<td align="center">

<button class="editBtn" data-index="${index}">
Edit
</button>

<button class="deleteBtn" data-index="${index}">
Delete
</button>

</td>

</tr>
`;

    });

    document.querySelectorAll(".editBtn").forEach(btn=>{

        btn.addEventListener("click",()=>{

            location.href = "edit-project.html?id=" + btn.dataset.index;

        });

    });

    document.querySelectorAll(".deleteBtn").forEach(btn=>{

        btn.addEventListener("click",()=>{

            deleteProject(Number(btn.dataset.index));

        });

    });

}

async function deleteProject(index){

    const ok = confirm("Are you sure you want to delete this project?");

    if(!ok){
        return;
    }

    try{

        currentProjects.splice(index,1);

        const response = await fetch(PROJECTS_API,{
            method:"POST",
            credentials:"include",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(currentProjects)
        });

        const result = await response.json();

        if(!response.ok || !result.success){

            throw new Error(result.error || "Delete failed");

        }

        alert("Project deleted successfully.");

        await loadProjects();

        renderProjects();

    }catch(error){

        console.error(error);

        alert(error.message || "Unable to delete project.");

    }

}

if(logoutBtn){

    logoutBtn.addEventListener("click",()=>{

        window.location.replace("./index.html");

    });

}

document.addEventListener("DOMContentLoaded",async()=>{

    try{

        const ok = await checkAuth();

        if(!ok){
            return;
        }

        await loadProjects();

        renderProjects();

    }catch(error){

        console.error(error);

        table.innerHTML = `
<tr>
<td colspan="4" align="center">
Unable to load projects.
</td>
</tr>`;

    }

});

})();



 
