(function () {

    "use strict";


    const PROJECT_INDEX_FILE = "project-index.json";


    /* =========================================================
       HTML ESCAPE
    ========================================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }



    /* =========================================================
       CREATE SAFE FILE URL
    ========================================================= */

    function createFileURL(relativePath) {

        return relativePath
            .split("/")
            .map(function (part) {

                return encodeURIComponent(part);

            })
            .join("/");

    }



    /* =========================================================
       CREATE FILE ITEM
    ========================================================= */

    function createFileItem(filePath) {

        const fileName =
            filePath.split("/").pop();


        const link =
            document.createElement("a");


        link.className =
            "automatic-file-item";


        link.href =
            createFileURL(filePath);


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.innerHTML = `

            <span class="automatic-file-icon">
                PDF
            </span>

            <span class="automatic-file-name">
                ${escapeHTML(fileName)}
            </span>

            <span class="automatic-file-arrow">
                ↗
            </span>

        `;


        return link;

    }



    /* =========================================================
       CREATE AUTOMATIC CLIENT PROJECT CARD
    ========================================================= */

    function createClientProjectCard(
        project,
        number
    ) {

        const card =
            document.createElement("article");


        card.className =
            "modal-project-card";


        const files =
            Array.isArray(project.files)
                ? project.files
                : [];


        const category =
            project.category ||
            "Engineering";


        const type =
            project.type ||
            "Engineering Project";


        const name =
            project.name ||
            "Engineering Project";



        /* =====================================================
           CARD HTML
        ===================================================== */

        card.innerHTML = `

            <div class="modal-project-number">
                ${String(number).padStart(2, "0")}
            </div>


            <div class="modal-project-content">

                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(type)}
                    project documentation and engineering
                    design files.
                </p>


                <div class="modal-project-tags">

                    <span>
                        ${escapeHTML(category)}
                    </span>

                    <span>
                        ${escapeHTML(type)}
                    </span>

                    <span>
                        ${files.length}
                        PDF${files.length === 1 ? "" : "s"}
                    </span>

                </div>


                <div class="automatic-files-title">
                    PROJECT DOCUMENTATION
                </div>

            </div>

        `;



        const content =
            card.querySelector(
                ".modal-project-content"
            );



        /* =====================================================
           FILE CONTAINER
        ===================================================== */

        if (files.length > 0) {

            const filesContainer =
                document.createElement("div");


            filesContainer.className =
                "automatic-project-files";


            files.forEach(function (filePath) {

                filesContainer.appendChild(
                    createFileItem(filePath)
                );

            });


            content.appendChild(
                filesContainer
            );

        } else {

            const empty =
                document.createElement("div");


            empty.className =
                "automatic-no-files";


            empty.textContent =
                "No PDF documentation has been added yet.";


            content.appendChild(
                empty
            );

        }


        return card;

    }



    /* =========================================================
       LOAD CLIENT PROJECTS
    ========================================================= */

    async function loadClientProjects(
        container
    ) {

        const category =
            container.dataset.projectCategory;


        if (!category) {

            container.innerHTML = `

                <div class="automatic-error">

                    <strong>
                        Project category is not defined.
                    </strong>

                    <p>
                        Add a data-project-category
                        attribute to this container.
                    </p>

                </div>

            `;

            return;

        }



        container.innerHTML = `

            <div class="files-loading">
                Loading client projects...
            </div>

        `;



        try {

            const response =
                await fetch(
                    PROJECT_INDEX_FILE +
                    "?v=" +
                    Date.now(),
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load project-index.json."
                );

            }



            const data =
                await response.json();



            if (!data.categories) {

                throw new Error(
                    "Project index does not contain categories."
                );

            }



            const categoryData =
                data.categories[category];



            container.innerHTML = "";



            /* =================================================
               CATEGORY DOES NOT EXIST
            ================================================= */

            if (!categoryData) {

                container.innerHTML = `

                    <div class="automatic-empty">

                        No projects have been added
                        to ${escapeHTML(category)}
                        yet.

                    </div>

                `;

                return;

            }



            const projects =
                Array.isArray(
                    categoryData.clientProjects
                )
                    ? categoryData.clientProjects
                    : [];



            /* =================================================
               NO CLIENT PROJECTS
            ================================================= */

            if (projects.length === 0) {

                container.innerHTML = `

                    <div class="automatic-empty">

                        No client projects have been
                        added to
                        ${escapeHTML(category)}
                        yet.

                    </div>

                `;

                return;

            }



            /* =================================================
               CREATE CARDS
            ================================================= */

            projects.forEach(
                function (project, index) {

                    container.appendChild(
                        createClientProjectCard(
                            project,
                            index + 1
                        )
                    );

                }
            );


        } catch (error) {

            console.error(
                "Automatic project system error:",
                error
            );


            container.innerHTML = `

                <div class="automatic-error">

                    <strong>
                        Unable to load client projects.
                    </strong>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    }



    /* =========================================================
       INITIALIZE CLIENT PROJECT SYSTEM
    ========================================================= */

    function initializeAutomaticProjects() {

        const containers =
            document.querySelectorAll(
                "[data-project-category]"
            );


        containers.forEach(
            function (container) {

                loadClientProjects(
                    container
                );

            }
        );

    }



    /* =========================================================
       LOAD OLD SELF-DIRECTED FILE SYSTEM
    ========================================================= */

    async function loadProjectFiles(
        container
    ) {

        const folder =
            container.dataset.projectFiles;


        if (!folder) {
            return;
        }



        container.innerHTML = `

            <div class="files-loading">
                Loading project files...
            </div>

        `;



        try {

            const response =
                await fetch(
                    folder +
                    "/files.json?v=" +
                    Date.now(),
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load project files."
                );

            }



            const data =
                await response.json();


            let files = [];



            if (Array.isArray(data)) {

                files = data;

            } else if (
                Array.isArray(data.files)
            ) {

                files = data.files;

            }



            container.innerHTML = "";



            if (files.length === 0) {

                container.innerHTML = `

                    <div class="files-empty">

                        No project documentation
                        has been added yet.

                    </div>

                `;

                return;

            }



            const filesContainer =
                document.createElement("div");


            filesContainer.className =
                "project-file-list";



            files.forEach(function (file) {

                let path;


                if (
                    typeof file ===
                    "string"
                ) {

                    path =
                        folder +
                        "/" +
                        file;

                } else if (
                    file &&
                    typeof file.path ===
                    "string"
                ) {

                    path =
                        folder +
                        "/" +
                        file.path;

                } else {

                    return;

                }



                const fileName =
                    path.split("/").pop();


                const link =
                    document.createElement("a");


                link.className =
                    "project-file-item";


                link.href =
                    createFileURL(path);


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.innerHTML = `

                    <span class="project-file-icon">
                        PDF
                    </span>

                    <span class="project-file-name">
                        ${escapeHTML(
                            fileName
                        )}
                    </span>

                    <span class="project-file-arrow">
                        ↗
                    </span>

                `;


                filesContainer.appendChild(
                    link
                );

            });



            container.appendChild(
                filesContainer
            );


        } catch (error) {

            console.error(
                "Project file loading error:",
                error
            );


            container.innerHTML = `

                <div class="files-error">

                    <strong>
                        Unable to load project files.
                    </strong>

                    <span>
                        ${escapeHTML(
                            error.message
                        )}
                    </span>

                </div>

            `;

        }

    }



    /* =========================================================
       INITIALIZE SELF-DIRECTED FILE SYSTEM
    ========================================================= */

    function initializeProjectFiles() {

        const containers =
            document.querySelectorAll(
                "[data-project-files]"
            );


        containers.forEach(
            function (container) {

                loadProjectFiles(
                    container
                );

            }
        );

    }



    /* =========================================================
       INITIALIZE EVERYTHING
    ========================================================= */

    function initialize() {

        initializeAutomaticProjects();

        initializeProjectFiles();

    }



    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }


})();
