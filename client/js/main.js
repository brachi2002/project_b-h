/**
 * @file main.js
 * @description לוגיקה בצד הלקוח לניהול פרויקטים, כולל טעינה, הוספה, עדכון, ומחיקת פרויקטים ותמונות.
 */
$(document).ready(function () {
    const apiUrl = "/projects";

/**
     * @function loadProjects
     * @description טוען את כל הפרויקטים ומציג אותם ברשימה.
     */
        function loadProjects() {
        $.ajax({
            url: `${apiUrl}`,
            method: "GET",
            success: function (projects) {
                const sortedProjects = Object.values(projects).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
                const projectHtml = sortedProjects.map(project => `
                    <div class="list-group-item">
                        <h5>${project.name}</h5>
                        <p>${project.summary}</p>
                        <p><strong>Manager:</strong> <a href="mailto:${project.manager.email}">${project.manager.name}</a></p>
                        <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleString()}</p>
                        <p><strong>Project ID:</strong> ${project.id}</p>
                        <button class="btn btn-primary btn-sm viewProject" data-id="${project.id}">View</button>
                        <button class="btn btn-danger btn-sm deleteProject" data-id="${project.id}">Delete</button>
                        <button class="btn btn-info btn-sm viewImages" data-id="${project.id}">View Images</button>
                        <button class="btn btn-warning btn-sm addImage" data-id="${project.id}">Add Image</button>
                        <button class="btn btn-secondary btn-sm viewTeam" data-id="${project.id}">View Team</button>
                        <button class="btn btn-success btn-sm editFields" data-id="${project.id}">Edit Fields</button>
                    </div>
                `).join('');
                const addProjectButton = `
                    <button id="addProject" class="btn btn-success mb-3">Add Project</button>
                `;
                $("#projectList").html(addProjectButton + projectHtml + addProjectButton);
            },
            error: function () {
                alert("Failed to load projects.");
            },
        });
    }

 /**
     * @event click.viewImages
     * @description מציג את רשימת התמונות בפרויקט כולל אפשרות למחוק תמונה.
     */
        $(document).on("click", ".viewImages", function () {
        const projectId = $(this).data("id");

        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "GET",
            success: function (project) {
                const imagesHtml = project.images.map(image => `
                    <div class="card m-2" style="width: 10rem;">
                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                        <div class="card-body">
                            <p class="card-text">${image.description || "No description"}</p>
                            <button class="btn btn-danger btn-sm removeImage" 
                                data-id="${image.id}" 
                                data-project-id="${projectId}">
                                Remove
                            </button>
                        </div>
                    </div>
                `).join('');

                $("#projectModalBody").html(`
                    <h4>Images of Project: ${project.name}</h4>
                    <div id="imageGallery" class="d-flex flex-wrap">${imagesHtml || "<p>No images available.</p>"}</div>
                `);
                $("#projectModal").modal("show");
            },
            error: function () {
                alert("Failed to load images.");
            },
        });
    });


/**
     * @event click.removeImage
     * @description מוחק תמונה מתוך פרויקט מסוים.
     */

    $(document).on("click", ".removeImage", function () {
        const projectId = $(this).data("project-id");
        const imageId = $(this).data("id");

        $.ajax({
            url: `${apiUrl}/${projectId}/images/${imageId}`,
            method: "DELETE",
            success: function () {
                alert("Image removed successfully!");
                $(`button[data-id="${imageId}"]`).closest(".card").remove(); // הסרת הכרטיס מהתצוגה
            },
            error: function () {
                alert("Failed to remove image.");
            },
        });
    });

/**
     * @event click.addImage
     * @description פותח חלון לבחירת תמונות להוספה לפרויקט על בסיס מילת מפתח.
     */

    $(document).on("click", ".addImage", function () {
        const projectId = $(this).data("id");
        const imageKeyword = prompt("Enter a keyword to search for images:");
        if (!imageKeyword) {
            alert("Keyword is required!");
            return;
        }

        $.ajax({
            url: `${apiUrl}/images/${imageKeyword}`,
            method: "GET",
            success: function (images) {
                const imagesHtml = images.map(image => `
                    <div class="card m-2" style="width: 10rem;">
                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                        <div class="card-body">
                            <p class="card-text">${image.description || "No description"}</p>
                            <button class="btn btn-primary selectImage" 
                                data-id="${image.id}" 
                                data-thumb="${image.thumb}" 
                                data-description="${image.description || ""}" 
                                data-project-id="${projectId}"
                                data-keyword="${imageKeyword}">>
                                Add This Image
                            </button>
                        </div>
                    </div>
                `).join('');
                $("#projectModalBody").html(`
                    <h4>Select an Image to Add</h4>
                    <div id="imageSearchResults" class="d-flex flex-wrap">${imagesHtml}</div>
                `);
                $("#projectModal").modal("show");
            },
            error: function (xhr) {
                console.error("Failed to fetch images:", xhr.responseText);
                alert("Failed to fetch images.");
            },
        });
    });

 /**
     * @event click.selectImage
     * @description מוסיף תמונה שנבחרה לפרויקט מסוים.
     */

    $(document).on("click", ".selectImage", function () {
        const projectId = $(this).data("project-id");
        const image = {
            id: $(this).data("id"),
            thumb: $(this).data("thumb"),
            description: $(this).data("description"),
            keyword: $(this).data("keyword"), // מוודאים שהשדה הזה מועבר
        };
    
    
        if (!projectId || !image.id || !image.thumb || !image.description || !image.keyword) {
            console.error("Missing required fields:", { projectId, ...image });
            alert("All fields are required to add an image!");
            return;
        }
    
        $.ajax({
            url: `${apiUrl}/${projectId}/images`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(image),
            success: function () {
                alert("Image added successfully!");
                $("#projectModal").modal("hide");
                loadProjects();
            },
            error: function (xhr) {
                console.error("Error adding image:", xhr.responseText);
                alert("Failed to add image.");
            },
        });
    });

/**
     * @event click.addProject
     * @description מציג טופס להוספת פרויקט חדש.
     */

    $(document).on("click", "#addProject", function () {
    $("#projectModalBody").html(`
        <form id="projectForm">
            <h4>Add New Project</h4>
            <div class="mb-3">
                <label for="name" class="form-label">Project Name:</label>
                <input type="text" id="name" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="summary" class="form-label">Summary:</label>
                <textarea id="summary" class="form-control" required></textarea>
            </div>
            <div class="mb-3">
                <label for="managerName" class="form-label">Manager Name:</label>
                <input type="text" id="managerName" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="managerEmail" class="form-label">Manager Email:</label>
                <input type="email" id="managerEmail" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="startDate" class="form-label">Start Date:</label>
                <input type="datetime-local" id="startDate" class="form-control" required>
            </div>

            <!-- Team Members Section -->
            <h5>Team Members</h5>
            <div id="teamMembers">
                <div class="team-member mb-3">
                    <input type="text" class="form-control mb-2 team-name" placeholder="Name" required>
                    <input type="email" class="form-control mb-2 team-email" placeholder="Email" required>
                    <input type="text" class="form-control mb-2 team-role" placeholder="Role" required>
                    <button type="button" class="btn btn-danger removeTeamMember">Remove</button>
                </div>
            </div>
            <button type="button" id="addTeamMember" class="btn btn-secondary mb-3">Add Team Member</button>

            <button type="submit" class="btn btn-success">Create Project</button>
        </form>
    `);
    $("#projectModal").modal("show");
});

/**
     * @event click.addTeamMember
     * @description מוסיף שדה להזנת חבר צוות חדש בטופס.
     */

$(document).on("click", "#addTeamMember", function () {
    $("#teamMembers").append(`
        <div class="team-member mb-3">
            <input type="text" class="form-control mb-2 team-name" placeholder="Name" required>
            <input type="email" class="form-control mb-2 team-email" placeholder="Email" required>
            <input type="text" class="form-control mb-2 team-role" placeholder="Role" required>
            <button type="button" class="btn btn-danger removeTeamMember">Remove</button>
        </div>
    `);
});



$(document).on("click", ".removeTeamMember", function () {
    const teamContainer = $(this).closest("#teamMembers");
    const teamMembers = teamContainer.find(".team-member");
    if (teamMembers.length > 1) {
        $(this).closest(".team-member").remove();
    } else {
        alert("At least one team member is required.");
    }
});

/**
     * @event submit.projectForm
     * @description שולח את פרטי הפרויקט החדש לשרת ויוצר פרויקט.
     */

$(document).on("submit", "#projectForm", function (e) {
    e.preventDefault();

    const team = $(".team-member").map(function () {
        return {
            name: $(this).find(".team-name").val(),
            email: $(this).find(".team-email").val(),
            role: $(this).find(".team-role").val(),
        };
    }).get();

    // Validation: Ensure at least one team member is added
    if (team.length === 0) {
        alert("You must add at least one team member.");
        return;
    }

    const newProject = {
        name: $("#name").val(),
        summary: $("#summary").val(),
        manager: {
            name: $("#managerName").val(),
            email: $("#managerEmail").val(),
        },
        team: team,
        start_date: $("#startDate").val(),
        images: [],
    };

    $.ajax({
        url: `${apiUrl}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newProject),
        success: function () {
            alert("Project created successfully!");
            $("#projectModal").modal("hide");
            loadProjects();
        },
        error: function (xhr) {
            console.error("Error creating project:", xhr.responseText);
            alert("Failed to create project.");
        },
    });
});

/**
     * @event click.viewProject
     * @description מציג פרטי פרויקט מסוים.
     */

$(document).on("click", ".viewProject", function () {
        const projectId = $(this).data("id");
        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "GET",
            success: function (project) {
                $("#projectModalBody").html(`
                    <h4>Project Details</h4>
                    <p><strong>Name:</strong> ${project.name}</p>
                    <p><strong>Summary:</strong> ${project.summary}</p>
                    <p><strong>Manager:</strong> ${project.manager.name} (${project.manager.email})</p>
                    <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleString()}</p>
                `);
                $("#projectModal").modal("show");
            },
            error: function () {
                alert("Failed to load project details.");
            },
        });
    });

    /**
     * @event click.deleteProject
     * @description מוחק פרויקט מסוים.
     */

    $(document).on("click", ".deleteProject", function () {
        const projectId = $(this).data("id");
        if (!confirm("Are you sure you want to delete this project?")) return;
        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "DELETE",
            success: function () {
                alert("Project deleted successfully!");
                loadProjects();
            },
            error: function () {
                alert("Failed to delete project.");
            },
        });
    });

   
/**
     * @event click.viewTeam
     * @description מציג את חברי הצוות של פרויקט מסוים.
     */
    $(document).on("click", ".viewTeam", function () {
        const projectId = $(this).data("id");

        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "GET",
            success: function (project) {
                const teamHtml = project.team.map(member => `
                    <div class="team-member mb-3">
                        <input type="text" class="form-control mb-2 team-name" value="${member.name}" readonly>
                        <input type="email" class="form-control mb-2 team-email" value="${member.email}" readonly>
                        <input type="text" class="form-control mb-2 team-role" value="${member.role}" readonly>
                    </div>
                `).join('');

                $("#projectModalBody").html(`
                    <h4>Team of Project: ${project.name}</h4>
                    <div id="teamMembers-${projectId}">
                        ${teamHtml || "<p>No team members available.</p>"}
                    </div>
                    <button type="button" class="btn btn-secondary addTeamMember" data-project-id="${projectId}">
                        Add Team Member
                    </button>
                    <button type="button" class="btn btn-success saveTeamChanges" data-project-id="${projectId}">
                        Save Changes
                    </button>
                `);
                $("#projectModal").modal("show");
            },
            error: function () {
                alert("Failed to load team members.");
            },
        });
    });

    /**
     * @event click.addTeamMember
     * @description מוסיף שדה להזנת חבר צוות חדש בטופס.
     */

    $(document).on("click", ".addTeamMember", function () {
        const projectId = $(this).data("project-id");
        $(`#teamMembers-${projectId}`).append(`
            <div class="team-member mb-3">
                <input type="text" class="form-control mb-2 team-name" placeholder="Name" required>
                <input type="email" class="form-control mb-2 team-email" placeholder="Email" required>
                <input type="text" class="form-control mb-2 team-role" placeholder="Role" required>
            </div>
        `);
    });
    
/**
     * @event click.saveTeamChanges
     * @description שומר שינויים ברשימת הצוות של פרויקט.
     */
    
    $(document).on("click", ".saveTeamChanges", function () {
        const projectId = $(this).data("project-id");
        const updatedTeam = $(`#teamMembers-${projectId} .team-member`).map(function () {
            return {
                name: $(this).find(".team-name").val(),
                email: $(this).find(".team-email").val(),
                role: $(this).find(".team-role").val(),
            };
        }).get();
    
        console.log("Attempting to update team for project:", projectId, updatedTeam);
    
        $.ajax({
            url: `/projects/${projectId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ team: updatedTeam }),
            success: function (response) {
                console.log("Server response:", response);
                alert("Team updated successfully!");
                $("#projectModal").modal("hide");
            },
            error: function (xhr) {
                console.error("Error updating team:", xhr.responseText);
                alert("Failed to update team.");
            },
        });
    });
    

/**
     * @event click.editFields
     * @description מציג טופס לעריכת שם ותקציר של פרויקט.
     */


    $(document).on("click", ".editFields", function () {
        const projectId = $(this).data("id");
        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "GET",
            success: function (project) {
                $("#projectModalBody").html(`
                    <form class="update-project-form" data-id="${projectId}">
                        <div class="mb-3">
                            <label for="name-${projectId}" class="form-label">Project Name:</label>
                            <input type="text" id="name-${projectId}" class="form-control" value="${project.name}" required>
                        </div>
                        <div class="mb-3">
                            <label for="summary-${projectId}" class="form-label">Summary:</label>
                            <textarea id="summary-${projectId}" class="form-control" required>${project.summary}</textarea>
                        </div>
                        <button type="submit" class="btn btn-success mt-3">Save Changes</button>
                    </form>
                `);
                $("#projectModal").modal("show");
            },
            error: function () {
                alert("Failed to load project details.");
            },
        });
    });

/**
     * @event submit.update-project-form
     * @description שומר את השינויים בעריכת פרויקט.
     */

    $(document).on("submit", ".update-project-form", function (e) {
        e.preventDefault();
        const projectId = $(this).data("id");
        const updatedProject = {
            name: $(`#name-${projectId}`).val(),
            summary: $(`#summary-${projectId}`).val(),
        };
        $.ajax({
            url: `${apiUrl}/${projectId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedProject),
            success: function () {
                alert("Project updated successfully!");
                $("#projectModal").modal("hide");
                loadProjects();
            },
            error: function () {
                alert("Failed to update project.");
            },
        });
    });

    

/**
     * @function init
     * @description אתחול טעינת הפרויקטים עם פתיחת העמוד.
     */

    loadProjects();
});
