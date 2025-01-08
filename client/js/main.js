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

    // איסוף מידע מהטופס
    const updatedProject = {
        name: $(`#name-${projectId}`).val(),
        summary: $(`#summary-${projectId}`).val(),
        manager: {
            name: $(`#managerName-${projectId}`).val(),
            email: $(`#managerEmail-${projectId}`).val(),
        },
        start_date: $(`#startDate-${projectId}`).val(),
        team: $(`#teamMembers-${projectId} .team-member`).map(function () {
            return {
                name: $(this).find(".team-name").val(),
                email: $(this).find(".team-email").val(),
                role: $(this).find(".team-role").val(),
            };
        }).get(),
        images: $(`#images-${projectId} .card`).map(function () {
            return {
                id: $(this).find(".removeImage").data("id"),
                thumb: $(this).find("img").attr("src"),
                description: $(this).find(".card-text").text(),
            };
        }).get(),
    };

    // שליחת המידע המעודכן לשרת
    $.ajax({
        url: `${apiUrl}/projects/${projectId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(updatedProject),
        success: function () {
            alert("Project updated successfully!");
            loadProjects(); // רענון רשימת הפרויקטים
        },
        error: function (xhr) {
            console.error("Error updating project:", xhr.responseText);
            alert("Failed to update project.");
        },
    });
});

    
    //הוספת חברי צוות לטופס פרויקט חדש
    $("#addTeamMember").click(function () {
        $("#teamMembers").append(`
            <div class="team-member mb-3">
                <input type="text" class="form-control mb-2 team-name" placeholder="Name" required>
                <input type="email" class="form-control mb-2 team-email" placeholder="Email" required>
                <input type="text" class="form-control mb-2 team-role" placeholder="Role" required>
                <button type="button" class="btn btn-danger removeTeamMember">Remove</button>
            </div>
        `);
    });

    // הוספת חברי צוות לפרויקט קיים
$(document).on("click", ".addTeamMember", function () {
    const projectId = $(this).data("project-id");

    // איתור אזור חברי הצוות של הפרויקט הנבחר
    $(`#teamMembers-${projectId}`).append(`
        <div class="team-member mb-3">
            <input type="text" class="form-control mb-2 team-name" placeholder="Name" required>
            <input type="email" class="form-control mb-2 team-email" placeholder="Email" required>
            <input type="text" class="form-control mb-2 team-role" placeholder="Role" required>
            <button type="button" class="btn btn-danger removeTeamMember">Remove</button>
        </div>
    `);
});

// הסרת חבר צוות
$(document).on("click", ".removeTeamMember", function () {
    $(this).closest(".team-member").remove();
});

    // סגירת פרטי פרויקט
$(document).on("click", ".closeDetails", function () {
    $(this).closest(".project-details").remove();
});


    //חיפוש תמונות ב-Unsplash
    $("#searchImages").click(function () {
        const keyword = $("#imageKeyword").val();

        if (!keyword) {
            alert("Please enter a keyword.");
            return;
        }

        $.ajax({
            url: `${apiUrl}/projects/images/${keyword}`,
            method: "GET",
            success: function (images) {
                const imagesHtml = images.map(image => `
                    <div class="card m-2" style="width: 18rem;">
                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                        <div class="card-body">
                            <p class="card-text">${image.description || "No description"}</p>
                            <button type="button" class="btn btn-primary selectImage" 
                                data-id="${image.id}" 
                                data-thumb="${image.thumb}" 
                                data-description="${image.description || ""}" 
                                data-keyword="${keyword}">
                                Select
                            </button>
                        </div>
                    </div>

                `).join('');
                $("#imageResults").html(imagesHtml);
            },
            error: function () {
                alert("Failed to fetch images.");
            },
        });
    });


    // משתנה זמני לאחסון תמונות שנבחרו לפרויקט חדש
let selectedImages = [];

$(document).on("click", ".selectImage", function () {
    const image = {
        id: $(this).data("id"),
        thumb: $(this).data("thumb"),
        description: $(this).data("description"),
        keyword: $(this).data("keyword"),
    };

    // בדיקה אם התמונה כבר קיימת
    if (selectedImages.some(img => img.id === image.id)) {
        alert("Image already selected.");
        return;
    }

    // הוספת התמונה למשתנה הזמני
    selectedImages.push(image);

    // הוספת התמונה לתצוגה
    $("#selectedImages").append(`
        <div class="card m-2" style="width: 18rem;">
            <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
            <div class="card-body">
                <p class="card-text">${image.description}</p>
                <button class="btn btn-danger removeImage" data-id="${image.id}">Remove</button>
            </div>
        </div>
    `);

    console.log(`Image added: ${image.description}`);
});
$(document).on("click", ".viewProject", function () {
    console.log("View Project button clicked"); // בדוק אם הכפתור נלחץ
    const projectId = $(this).data("id");
    console.log("Project ID:", projectId); // בדוק מה ה-ID שמתקבל
    $.ajax({
        url: `${apiUrl}/projects/${projectId}`,
        method: "GET",
        success: function (project) {
            console.log("AJAX Success:", project); // בדוק אם הנתונים מוחזרים מהשרת
            const detailsHtml = `
                <h4>${project.name}</h4>
                <p>${project.summary}</p>
                <p><strong>Manager:</strong> ${project.manager.name} (<a href="mailto:${project.manager.email}">${project.manager.email}</a>)</p>
                <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleString()}</p>
                <h5>Team Members</h5>
                <ul>
                    ${project.team.map(member => `
                        <li>${member.name} (${member.role}) - <a href="mailto:${member.email}">${member.email}</a></li>
                    `).join('')}
                </ul>
                <h5>Images</h5>
                <div class="d-flex flex-wrap">
                    ${project.images.map(image => `
                        <div class="card m-2" style="width: 18rem;">
                            <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                            <div class="card-body">
                                <p>${image.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            $("#projectModalBody").html(detailsHtml);
            $("#projectModal").modal("show");
        },
        error: function (xhr) {
            console.error("AJAX Error:", xhr.responseText); // בדוק אם יש שגיאה
            alert("Failed to load project details.");
        },
    });
    
});

 
 
 

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 



// הסרת תמונה
$(document).on("click", ".removeImage", function () {
    const imageId = $(this).data("id");

    // הסרת התמונה מהמשתנה הזמני
    selectedImages = selectedImages.filter(image => image.id !== imageId);

    // הסרת התמונה מהתצוגה
    $(this).closest(".card").remove();
});

// יצירת פרויקט חדש
$("#projectForm").submit(function (e) {
    e.preventDefault();

    // איסוף נתוני חברי צוות
    const team = $(".team-member").map(function () {
        const name = $(this).find(".team-name").val();
        const email = $(this).find(".team-email").val();
        const role = $(this).find(".team-role").val();
        return { name, email, role };
    }).get();

    // יצירת אובייקט הפרויקט
    const newProject = {
        name: $("#name").val(),
        summary: $("#summary").val(),
        manager: {
            name: $("#managerName").val(),
            email: $("#managerEmail").val(),
        },
        team: team || [],
        images: selectedImages || [], // שימוש במשתנה הזמני של התמונות שנבחרו
        start_date: $("#startDate").val(),
    };

    // בדיקת תקינות קלט
    if (!newProject.name || !newProject.summary || !newProject.manager.name || !newProject.manager.email || !newProject.start_date) {
        alert("Please fill out all required fields.");
        return;
    }

    // שליחת הבקשה לשרת
    $.ajax({
        url: `${apiUrl}/projects`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newProject),
        success: function () {
            alert("Project created successfully!");
            selectedImages = []; // איפוס המשתנה הזמני לאחר יצירת הפרויקט
            loadProjects();
        },
        error: function (xhr) {
            console.error("Error creating project:", xhr.responseText);
            alert("Failed to create project.");
        },
    });
});



    
    loadProjects();
});
