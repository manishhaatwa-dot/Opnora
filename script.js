document.addEventListener("DOMContentLoaded", () => {

fetch("projects.json")
.then(response => response.json())
.then(projects => {

const container = document.getElementById("projects");

container.innerHTML = "";

projects.forEach(project => {

container.innerHTML += `
<div class="portfolio-card">

<img src="${project.image}" alt="${project.title}" class="project-img">

<h3>${project.title}</h3>

<p>${project.description}</p>

<a href="${project.link}" target="_blank" class="btn">
${project.button}
</a>

</div>
`;

});

})
.catch(error => {
console.log("Projects Load Error:", error);
});

});
