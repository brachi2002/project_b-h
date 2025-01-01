$(document).ready(function () {
    const apiUrl = "/api";

    // טוען את כל הפרויקטים
    function loadProjects() {
        $.ajax({
            url: `${apiUrl}/projects`,
            method: "GET",
            success: function (projects) {
                console.log("Projects loaded:", projects);
                const projectHtml = Object.values(projects).map(project => `
                    <div class="list-group-item">
                        <h5>${project.name}</h5>
                        <p>${project.summary}</p>
                        <p><strong>Manager:</strong> ${project.manager.name} (<a href="mailto:${project.manager.email}">${project.manager.email}</a>)</p>
                        <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleString()}</p>
                    </div>
                `).join('');
                $("#projectList").html(projectHtml);
            },
            error: function () {
                alert("Failed to load projects.");
            },
        });
    }

    // הוספת שדות למשתתפים
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

    // הסרת משתתף
    $(document).on("click", ".removeTeamMember", function () {
        $(this).closest(".team-member").remove();
    });

    // חיפוש תמונות ב-Unsplash
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
                            <button class="btn btn-primary selectImage" 
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

    // בחירת תמונה
    $(document).on("click", ".selectImage", function () {
        const image = {
            id: $(this).data("id"),
            thumb: $(this).data("thumb"),
            description: $(this).data("description"),
            keyword: $(this).data("keyword"),
        };

        $("#selectedImages").append(`
            <div class="card m-2" style="width: 18rem;">
                <img src="${image.thumb}" class="card-img-top" alt="${image.description}">
                <div class="card-body">
                    <p class="card-text">${image.description}</p>
                    <button class="btn btn-danger removeImage" data-id="${image.id}">Remove</button>
                </div>
            </div>
        `);
    });

    // הסרת תמונה שנבחרה
    $(document).on("click", ".removeImage", function () {
        $(this).closest(".card").remove();
    });

    // יצירת פרויקט חדש
    $("#projectForm").submit(function (e) {
        e.preventDefault();

        // איסוף משתתפים
        const team = $(".team-member").map(function () {
            const name = $(this).find(".team-name").val();
            const email = $(this).find(".team-email").val();
            const role = $(this).find(".team-role").val();
            return { name, email, role };
        }).get();

        // איסוף תמונות
        const images = $("#selectedImages .card").map(function () {
            return {
                id: $(this).find("button").data("id"),
                thumb: $(this).find("img").attr("src"),
                description: $(this).find(".card-text").text(),
                keyword: $(this).find("button").data("keyword"),
            };
        }).get();

        // יצירת האובייקט של הפרויקט
        const newProject = {
            name: $("#name").val(),
            summary: $("#summary").val(),
            manager: {
                name: $("#managerName").val(),
                email: $("#managerEmail").val(),
            },
            team,
            images,
            start_date: $("#startDate").val(),
        };

        console.log("Submitting project:", newProject);

        // שליחת הפרויקט לשרת
        $.ajax({
            url: `${apiUrl}/projects`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newProject),
            success: function () {
                alert("Project created successfully!");
                loadProjects();
            },
            error: function () {
                alert("Failed to create project.");
            },
        });
    });

    // טוען את כל הפרויקטים עם פתיחת הדף
    loadProjects();
});
