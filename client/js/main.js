$(document).ready(function () {
    const apiUrl = "/api";

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
                            <button class="btn btn-primary selectImage" data-id="${image.id}" data-thumb="${image.thumb}" data-description="${image.description || ""}" data-keyword="${keyword}">Select</button>
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

        const images = $("#selectedImages .card").map(function () {
            return {
                id: $(this).find("button").data("id"),
                thumb: $(this).find("img").attr("src"),
                description: $(this).find(".card-text").text(),
                keyword: $(this).find("button").data("keyword"),
            };
        }).get();

        const newProject = {
            name: $("#name").val(),
            summary: $("#summary").val(),
            manager: {
                name: $("#managerName").val(),
                email: $("#managerEmail").val(),
            },
            team: [],
            images,
            start_date: $("#startDate").val(),
        };

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
