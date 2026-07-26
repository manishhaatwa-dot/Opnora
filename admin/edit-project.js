(() => {

const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";

const AUTH_URL = `${API_BASE}/api/check-auth`;
const PROJECTS_API = `${API_BASE}/api/projects`;
const UPLOAD_API = `${API_BASE}/api/upload`;
const PROJECTS_JSON = "/projects.json";

const form = document.getElementById("editProjectForm");

const projectName = document.getElementById("projectName");
const projectDescription = document.getElementById("projectDescription");
const projectLink = document.getElementById("projectLink");
const projectCategory = document.getElementById("projectCategory");
const projectImage = document.getElementById("projectImage");

const logoutBtn = document.getElementById("logoutBtn");

const params = new URLSearchParams(window.location.search);
const projectId = Number(params.get("id"));

let projects = [];

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

    const response = await fetch(PROJECTS_JSON,{
        cache:"no-store"
    });

    if(!response.ok){

        throw new Error("Unable to load projects");

    }

    const data = await response.json();

    projects = Array.isArray(data)
        ? data
        : (data.projects || []);

}

function fillForm(){

    const project = projects[projectId];

    if(!project){

        alert("Project not found.");

        window.location.replace("./projects.html");

        return;

    }

    projectName.value = project.title || "";
    projectDescription.value = project.description || "";
    projectLink.value = project.link || "";
    projectCategory.value = project.category || "Website";

}

function fileToBase64(file){

    return new Promise((resolve,reject)=>{

        const reader = new FileReader();

        reader.onload=()=>{

            resolve(reader.result.split(",")[1]);

        };

        reader.onerror=reject;

        reader.readAsDataURL(file);

    });

}

if(logoutBtn){

    logoutBtn.onclick=()=>{

        window.location.replace("./index.html");

    };

}
 async function uploadNewImage(file){

    if(!file){
        return null;
    }

    const base64content = await fileToBase64(file);

    const filename = Date.now() + "_" + file.name.replace(/\s+/g,"_");

    const response = await fetch(UPLOAD_API,{
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            filename,
            base64content
        })
    });

    const data = await response.json();

    if(!response.ok || !data.success){
        throw new Error(data.error || "Image upload failed");
    }

    return data.path;

}

async function updateProject(){

    const project = projects[projectId];

    if(!project){
        throw new Error("Project not found");
    }

    project.title = projectName.value.trim();

    project.description = projectDescription.value.trim();

    project.link = projectLink.value.trim();

    project.category = projectCategory.value;

    if(projectImage.files.length){

        const imagePath = await uploadNewImage(projectImage.files[0]);

        project.image = imagePath;

    }

    const response = await fetch(PROJECTS_API,{

        method:"POST",

        credentials:"include",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(projects)

    });

    const data = await response.json();

    if(!response.ok || !data.success){

        throw new Error(data.error || "Unable to update project");

    }

} 

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try{

        if(projectName.value.trim()===""){

            alert("Please enter Project Name");
            return;

        }

        if(projectDescription.value.trim()===""){

            alert("Please enter Project Description");
            return;

        }

        if(projectLink.value.trim()===""){

            alert("Please enter Project Link");
            return;

        }

        const submitBtn=form.querySelector("button[type='submit']");

        submitBtn.disabled=true;

        submitBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

        await updateProject();

        alert("Project updated successfully.");

        window.location.replace("./projects.html");

    }catch(error){

        console.error(error);

        alert(error.message || "Unable to update project.");

    }finally{

        const submitBtn=form.querySelector("button[type='submit']");

        submitBtn.disabled=false;

        submitBtn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Update Project';

    }

});

document.addEventListener("DOMContentLoaded", async()=>{

    try{

        const ok=await checkAuth();

        if(ok){

            await loadProjects();

            fillForm();

        }

    }catch(error){

        console.error(error);

        window.location.replace("./index.html");

    }

});

})();




 
