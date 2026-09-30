(function () {

    "use strict";


    /* =========================================================
       PROJECT INDEX
       Used ONLY for automatic Client Projects
       ========================================================= */

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
       SELF-DIRECTED PROJECT FILE URL
       
       Important:
       - Uses the actual page URL as the base
       - Does NOT use encodeURIComponent()
       - Keeps GitHub Pages paths simple
       ========================================================= */

    function createSelfDirectedFileURL(
        folder,
        filename
    ) {

        const cleanFolder =
            String(folder)
                .replace(/\\/g, "/")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "")
                .trim();


        const cleanFilename =
            String(filename)
                .replace(/\\/g, "/")
                .replace(/^\/+/, "")
                .trim();


        const relativePath =
            cleanFolder +
            "/" +
            cleanFilename;


        try {

            return new URL(
                relativePath,
                document.baseURI
            ).href;

        }

        catch (error) {

            console.error(
                "Unable to create PDF URL:",
                relativePath,
                error
            );

            return relativePath;

        }

    }


    /* =========================================================
       CREATE SELF-DIRECTED FILE CARD
       ========================================================= */

    function createSelfDirectedFileItem(
        folder,
        filename
    ) {

        const link =
            document.createElement("a");


        link.className =
            "project-file-item";


        link.href =
            createSelfDirectedFileURL(
                folder,
                filename
            );


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.innerHTML = `

            <span class="project-file-icon">
                PDF
            </span>

            <span class="project-file-name">
                ${escapeHTML(filename)}
            </span>

            <span class="project-file-arrow">
                ↗
            </span>

        `;


        return link;

    }


    /* =========================================================
       SELF-DIRECTED PROJECT FILE LOADER
       
       This handles:
       
       Files/FDAS/files.json
       Files/Cctv/files.json
       Files/ELV/files.json
       
       Nothing else.
       ========================================================= */

    async function loadSelfDirectedFiles(
        container
    ) {

        const folder =
            container.dataset.projectFiles;


        if (!folder) {
            return;
        }


        const cleanFolder =
            String(folder)
                .replace(/\\/g, "/")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "")
                .trim();


        container.innerHTML = `

            <div class="files-loading">
                Loading project files...
            </div>

        `;


        try {

            /* =================================================
               CREATE MANIFEST URL
               
               Example:
               Files/Cctv/files.json
               ================================================= */

            const manifestURL =
                new URL(
                    cleanFolder +
                    "/files.json",
                    document.baseURI
                );


            /* Prevent browser caching */

            manifestURL.searchParams.set(
                "v",
                Date.now().toString()
            );


            console.log(
                "Loading self-directed manifest:",
                manifestURL.href
            );


            /* =================================================
               LOAD files.json
               ================================================= */

            const response =
                await fetch(
                    manifestURL.href,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load " +
                    cleanFolder +
                    "/files.json " +
                    "(HTTP " +
                    response.status +
                    ")."
                );

            }


            /* =================================================
               READ JSON
               ================================================= */

            const data =
                await response.json();


            let files = [];


            /*
             Supports:

             {
                 "files": [
                     "example.pdf"
                 ]
             }

             and also:

             [
                 "example.pdf"
             ]
            */

            if (
                Array.isArray(data)
            ) {

                files = data;

            }

            else if (
                data &&
                Array.isArray(data.files)
            ) {

                files = data.files;

            }


            /* =================================================
               REMOVE INVALID VALUES
               ================================================= */

            files =
                files.filter(
                    function (file) {

                        return (
                            typeof file ===
                            "string" &&
                            file.trim() !== ""
                        );

                    }
                );


            container.innerHTML = "";


            /* =================================================
               NO FILES
               ================================================= */

            if (files.length === 0) {

                container.innerHTML = `

                    <div class="files-empty">
                        No project documentation
                        has been added yet.
                    </div>

                `;

                return;

            }


            /* =================================================
               CREATE FILE LIST
               ================================================= */

            const filesContainer =
                document.createElement("div");


            filesContainer.className =
                "project-file-list";


            files.forEach(
                function (filename) {

                    const fileItem =
                        createSelfDirectedFileItem(
                            cleanFolder,
                            filename
                        );


                    filesContainer.appendChild(
                        fileItem
                    );

                }
            );


            container.appendChild(
                filesContainer
            );


        }

        catch (error) {

            console.error(
                "Self-directed project file error:",
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
       AUTOMATIC CLIENT PROJECT SYSTEM
       
       IMPORTANT:
       This section is preserved separately.
       It does NOT affect Self-Directed Projects.
       ========================================================= */


    function createAutomaticFileItem(
        filePath
    ) {

        const cleanPath =
            String(filePath)
                .replace(/\\/g, "/")
                .replace(/^\/+/, "")
                .trim();


        const fileName =
            cleanPath
                .split("/")
                .pop();


        const link =
            document.createElement("a");


        link.className =
            "automatic-file-item";


        link.href =
            cleanPath;


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


        if (files.length > 0) {

            const filesContainer =
                document.createElement("div");


            filesContainer.className =
                "automatic-project-files";


            files.forEach(
                function (filePath) {

                    if (
                        typeof filePath !==
                        "string"
                    ) {
                        return;
                    }


                    filesContainer.appendChild(
                        createAutomaticFileItem(
                            filePath
                        )
                    );

                }
            );


            content.appendChild(
                filesContainer
            );

        }

        else {

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
                        Add a
                        data-project-category
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


            if (
                !data ||
                typeof data !== "object" ||
                !data.categories
            ) {

                throw new Error(
                    "Project index does not contain categories."
                );

            }


            const categoryData =
                data.categories[category];


            container.innerHTML = "";


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


            projects.forEach(
                function (
                    project,
                    index
                ) {

                    container.appendChild(
                        createClientProjectCard(
                            project,
                            index + 1
                        )
                    );

                }
            );

        }

        catch (error) {

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
       INITIALIZE
       ========================================================= */

    function initialize() {


        /* =====================================================
           SELF-DIRECTED PROJECTS
           ===================================================== */

        const selfDirectedContainers =
            document.querySelectorAll(
                "[data-project-files]"
            );


        selfDirectedContainers.forEach(
            function (container) {

                loadSelfDirectedFiles(
                    container
                );

            }
        );


        /* =====================================================
           CLIENT PROJECTS
           ===================================================== */

        const clientProjectContainers =
            document.querySelectorAll(
                "[data-project-category]"
            );


        clientProjectContainers.forEach(
            function (container) {

                loadClientProjects(
                    container
                );

            }
        );

    }


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    }

    else {

        initialize();

    }

})();
