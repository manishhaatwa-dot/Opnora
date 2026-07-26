(() => {

const API_BASE = "https://opnora-admin-api.manishhaatwa.workers.dev";

const AUTH_URL = `${API_BASE}/api/check-auth`;
const PROJECTS_API = `${API_BASE}/api/projects`;
const UPLOAD_API = `${API_BASE}/api/upload`;
const PROJECTS_JSON = "/projects.json";

const form = document.getElementById("projectForm");

const projectName = document.getElementById("projectName");
const projectDescription = document.getElementById("projectDescription");
const projectLink = document.getElementById("projectLink");
const projectCategory = document.getElementById("projectCategory");
const projectImage = document.getElementById("projectImage");

const logoutBtn = document.getElementById("logoutBtn");

let currentProjects = [];

async function checkAuth() {

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

        throw new Error("Unable to load projects.json");

    }

    const data = await response.json();

    currentProjects = Array.isArray(data)
        ? data
        : (data.projects || []);

}

function fileToBase64(file){

    return new Promise((resolve,reject)=>{

        const reader = new FileReader();

        reader.onload = ()=>{

            const result = reader.result.split(",")[1];

            resolve(result);

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

if(logoutBtn){

    logoutBtn.onclick=()=>{

        window.location.replace("./index.html");

    };

}
async function uploadImage(file){

    if(!file){

        return "";

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

async function saveProject(){

    const imageFile = projectImage.files[0];

    const imagePath = await uploadImage(imageFile);

    const newProject = {

        title:projectName.value.trim(),

        description:projectDescription.value.trim(),

        image:imagePath,

        link:projectLink.value.trim(),

        category:projectCategory.value,

        button:"Visit Website"

    };

    currentProjects.push(newProject);

    const response = await fetch(PROJECTS_API,{

        method:"POST",

        credentials:"include",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(currentProjects)

    });

    const data = await response.json();

    if(!response.ok || !data.success){

        throw new Error(data.error || "Unable to save project");

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

        if(projectImage.files.length===0){

            alert("Please select Project Image");
            return;

        }

        const submitBtn=form.querySelector("button[type='submit']");

        submitBtn.disabled=true;

        submitBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        await saveProject();

        alert("Project added successfully.");

        form.reset();

        window.location.replace("./projects.html");

    }catch(error){

        console.error(error);

        alert(error.message || "Something went wrong.");

    }finally{

        const submitBtn=form.querySelector("button[type='submit']");

        submitBtn.disabled=false;

        submitBtn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Save Project';

    }

});

document.addEventListener("DOMContentLoaded", async()=>{

    try{

        const ok=await checkAuth();

        if(ok){

            await loadProjects();

        }

    }catch(error){

        console.error(error);

        window.location.replace("./index.html");

    }

});

})();
 
