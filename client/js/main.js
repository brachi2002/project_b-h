$(document).ready(function () {
    const apiUrl = "/projects";

    // טוען את כל הפרויקטים
    function loadProjects() {
        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function (projects) {
                const projectHtml = Object.values(projects).map(project => `
                    <div class="list-group-item">
                        <h5>${project.name}</h5>
                        <p>${project.summary}</p>
                        <p><strong>Manager:</strong> ${project.manager.name} (<a href="mailto:${project.manager.email}">${project.manager.email}</a>)</p>
                        <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleString()}</p>
                        <button class="btn btn-primary btn-sm viewProject" data-id="${project.id}">View</button>
                        <button class="btn btn-danger btn-sm deleteProject" data-id="${project.id}">Delete</button>
                    </div>
                `).join('');
                $("#projectList").html(projectHtml);
            },
            error: function () {
                alert("Failed to load projects.");
            },
        });
    }

    // מחיקת פרויקט
    $(document).on("click", ".deleteProject", function () {
        const projectId = $(this).data("id");

        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "DELETE",
            success: function () {
                alert("Project deleted successfully!");
                loadProjects();
            },
            error: function (xhr) {
                console.error("Error deleting project:", xhr.responseText);
                alert("Failed to delete project.");
            },
        });
    });

    // צפייה ועריכת פרויקט
    $(document).on("click", ".viewProject", function () {
        const projectId = $(this).data("id");
        const projectCard = $(this).closest(".list-group-item");

        if (projectCard.find(".project-details").length) {
            projectCard.find(".project-details").remove();
            return;
        }

        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "GET",
            success: function (project) {
                const detailsHtml = `
                    <div class="project-details">
                        <form class="update-project-form" data-id="${projectId}">
                            <h4>Edit Project</h4>
                            <div class="mb-3">
                                <label for="name-${projectId}" class="form-label">Project Name:</label>
                                <input type="text" id="name-${projectId}" class="form-control" value="${project.name}">
                            </div>
                            <div class="mb-3">
                                <label for="summary-${projectId}" class="form-label">Summary:</label>
                                <textarea id="summary-${projectId}" class="form-control">${project.summary}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="startDate-${projectId}" class="form-label">Start Date:</label>
                                <input type="datetime-local" id="startDate-${projectId}" class="form-control" value="${new Date(project.start_date).toISOString().slice(0, 16)}">
                            </div>

                            <h5>Team Members</h5>
                            <div id="teamMembers-${projectId}">
                                ${project.team.map(member => `
                                    <div class="team-member mb-3">
                                        <p><strong>${member.name}</strong> - ${member.role} (<a href="mailto:${member.email}">${member.email}</a>)</p>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-secondary addTeamMember" data-project-id="${projectId}">Add Team Member</button>

                            <h5>Images</h5>
                            <div id="images-${projectId}">
                                ${project.images.map(image => `
                                    <div class="card m-2" style="width: 18rem;">
                                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                                        <div class="card-body">
                                            <p class="card-text">${image.description}</p>
                                            <button class="btn btn-danger removeImage" data-id="${image.id}" data-project-id="${projectId}">Remove</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-primary addImages" data-id="${projectId}">Add Images</button>
                            <div id="imagesModal-${projectId}" class="mt-3" style="display:none;">
                                <input type="text" id="imageKeyword-${projectId}" class="form-control mb-3" placeholder="Search for images">
                                <button type="button" class="btn btn-secondary searchImages" data-id="${projectId}">Search</button>
                                <div id="imageResults-${projectId}" class="d-flex flex-wrap mt-3"></div>
                            </div>

                            <button type="submit" class="btn btn-success">Save Changes</button>
                            <button type="button" class="btn btn-secondary closeDetails">Close</button>
                        </form>
                    </div>
                `;
                projectCard.append(detailsHtml);
            },
            error: function (xhr) {
                console.error("Error loading project:", xhr.responseText);
                alert("Failed to load project details.");
            },
        });
    });

    // הוספת תמונות לפרויקט
    $(document).on("click", ".addImages", function () {
        const projectId = $(this).data("id");
        $(`#imagesModal-${projectId}`).toggle();
    });

    $(document).on("click", ".searchImages", function () {
        const projectId = $(this).data("id");
        const keyword = $(`#imageKeyword-${projectId}`).val();

        if (!keyword) {
            alert("Please enter a keyword.");
            return;
        }

        $.ajax({
            url: `${apiUrl}/images/${keyword}`,
            method: "GET",
            success: function (images) {
                const imagesHtml = images.map(image => `
                    <div class="card m-2" style="width: 18rem;">
                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                        <div class="card-body">
                            <p class="card-text">${image.description || "No description"}</p>
                            <button class="btn btn-primary selectImageForProject" 
                                data-id="${image.id}" 
                                data-thumb="${image.thumb}" 
                                data-description="${image.description || ""}" 
                                data-project-id="${projectId}">
                                Select
                            </button>
                        </div>
                    </div>
                `).join('');
                $(`#imageResults-${projectId}`).html(imagesHtml);
            },
            error: function () {
                alert("Failed to fetch images.");
            },
        });
    });

    $(document).on("click", ".selectImageForProject", function () {
        const projectId = $(this).data("project-id");
        const image = {
            id: $(this).data("id"),
            thumb: $(this).data("thumb"),
            description: $(this).data("description"),
        };

        $.ajax({
            url: `${apiUrl}/${projectId}/images`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(image),
            success: function () {
                alert("Image added successfully!");
                loadProjects();
            },
            error: function (xhr) {
                console.error("Error adding image:", xhr.responseText);
                alert("Failed to add image.");
            },
        });
    });

    // שמירת שינויים בפרויקט
    $(document).on("submit", ".update-project-form", function (e) {
        e.preventDefault();

        const projectId = $(this).data("id");

        const updatedProject = {
            name: $(`#name-${projectId}`).val(),
            summary: $(`#summary-${projectId}`).val(),
            start_date: $(`#startDate-${projectId}`).val(),
        };

        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedProject),
            success: function () {
                alert("Project updated successfully!");
                loadProjects();
            },
            error: function (xhr) {
                console.error("Error updating project:", xhr.responseText);
                alert("Failed to update project.");
            },
        });
    });

    loadProjects();
});
