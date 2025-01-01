$(document).ready(function () {
    const apiUrl = "/api";

    // הצגת כל הפרויקטים
    function loadProjects() {
        $.ajax({
            url: `${apiUrl}/projects`,
            method: "GET",
            success: function (projects) {
                let projectHtml = projects.map(project => `
                    <div class="list-group-item">
                        <h5>${project.name}</h5>
                        <p>${project.summary}</p>
                        <p><strong>Manager:</strong> <a href="mailto:${project.manager}">${project.manager}</a></p>
                        <p><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleString()}</p>
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

    // פתיחת טופס הוספת פרויקט
    $("#addProjectButton").click(function () {
        $("#addProjectForm").show();
    });

    // סגירת טופס הוספת פרויקט
    $("#cancelButton").click(function () {
        $("#addProjectForm").hide();
    });

    // הוספת פרויקט חדש
    $("#projectForm").submit(function (e) {
        e.preventDefault();

        const newProject = {
            name: $("#name").val(),
            summary: $("#summary").val(),
            manager: $("#manager").val(),
            startDate: $("#startDate").val(),
            team: [],
        };

        $.ajax({
            url: `${apiUrl}/projects`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newProject),
            success: function () {
                alert("Project added successfully!");
                $("#addProjectForm").hide();
                loadProjects();
            },
            error: function () {
                alert("Failed to add project.");
            },
        });
    });

    // חיפוש תמונות ב-Unsplash
    function searchImages(keyword) {
        $.ajax({
            url: `/api/projects/images/${keyword}`,
            method: "GET",
            success: function (images) {
                let imagesHtml = images.map((image) => `
                    <div class="card" style="width: 18rem;">
                        <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                        <div class="card-body">
                            <p class="card-text">${image.description}</p>
                            <button class="btn btn-primary addImage" data-id="${image.id}" data-path="${image.thumb}" data-description="${image.description}" data-keyword="${image.keyword}">Add</button>
                        </div>
                    </div>
                `).join('');
                $("#imageResults").html(imagesHtml);
            },
            error: function () {
                alert("Failed to fetch images.");
            },
        });
    }

    // הוספת אירוע חיפוש תמונות
    $("#searchImagesButton").click(function () {
        const keyword = $("#imageKeyword").val();
        searchImages(keyword);
    });

    // הוספת תמונה לפרויקט
    $(document).on("click", ".addImage", function () {
        const projectId = $("#currentProjectId").val(); // מזהה הפרויקט
        const newImage = {
            id: $(this).data("id"),
            thumb: $(this).data("path"),
            description: $(this).data("description"),
            keyword: $(this).data("keyword"),
        };

        $.ajax({
            url: `/api/projects/${projectId}/images`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newImage),
            success: function () {
                alert("Image added successfully!");
            },
            error: function () {
                alert("Failed to add image.");
            },
        });
    });

    // טוען את כל הפרויקטים עם פתיחת הדף
    loadProjects();
});
