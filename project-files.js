document.addEventListener("DOMContentLoaded", function () {

    const fileContainers = document.querySelectorAll(
        "[data-project-files]"
    );

    if (!fileContainers.length) {
        return;
    }

    fileContainers.forEach(function (container) {

        const folder = container.getAttribute(
            "data-project-files"
        );

        if (!folder) {
            return;
        }

        loadProjectFiles(container, folder);
    });


    async function loadProjectFiles(container, folder) {

        container.innerHTML = `
            <div class="files-loading">
                Loading project files...
            </div>
        `;

        /*
         * The GitHub Actions workflow automatically creates
         * files.json inside every project folder.
         *
         * Example:
         *
         * Files/Cctv/files.json
         * Files/FDAS/files.json
         * Files/ELV/files.json
         *
         * No GitHub API is used here.
         */

        const cleanFolder = folder.replace(/\/+$/, "");

        const manifestUrl =
            cleanFolder + "/files.json";


        try {

            const response = await fetch(
                manifestUrl + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Unable to load " +
                    manifestUrl +
                    " (HTTP " +
                    response.status +
                    ")"
                );
            }


            const data = await response.json();


            let files = [];


            /*
             * Supported format:
             *
             * {
             *     "files": [
             *         "example.pdf"
             *     ]
             * }
             */

            if (Array.isArray(data)) {

                files = data;

            } else if (
                data &&
                Array.isArray(data.files)
            ) {

                files = data.files;

            } else {

                throw new Error(
                    "Invalid files.json format."
                );
            }


            /*
             * Convert filenames into objects.
             */

            files = files
                .map(function (file) {

                    if (typeof file === "string") {

                        return {
                            name: file,
                            path: file
                        };

                    }


                    if (
                        file &&
                        typeof file === "object" &&
                        file.name
                    ) {

                        return {
                            name: file.name,
                            path: file.path || file.name
                        };

                    }


                    return null;

                })
                .filter(Boolean);


            /*
             * Sort files alphabetically.
             */

            files.sort(function (a, b) {

                return a.name.localeCompare(
                    b.name,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );

            });


            /*
             * No files yet.
             */

            if (!files.length) {

                container.innerHTML = `
                    <div class="files-empty">
                        No project files available yet.
                    </div>
                `;

                return;
            }


            /*
             * Create the file list.
             */

            const list =
                document.createElement("div");

            list.className =
                "project-file-list";


            files.forEach(function (file) {

                const link =
                    document.createElement("a");


                link.className =
                    "project-file-item";


                link.target = "_blank";


                link.rel =
                    "noopener noreferrer";


                /*
                 * Encode each path section separately
                 * so spaces in filenames work correctly.
                 */

                const encodedPath =
                    file.path
                        .split("/")
                        .map(function (part) {
                            return encodeURIComponent(part);
                        })
                        .join("/");


                link.href =
                    cleanFolder +
                    "/" +
                    encodedPath;


                link.innerHTML = `
                    <span class="project-file-icon">
                        PDF
                    </span>

                    <span class="project-file-name">
                        ${escapeHTML(file.name)}
                    </span>

                    <span class="project-file-arrow">
                        ↗
                    </span>
                `;


                list.appendChild(link);

            });


            /*
             * Display the files.
             */

            container.innerHTML = "";

            container.appendChild(list);

        }


        catch (error) {

            console.error(
                "Project file loader error:",
                error
            );


            container.innerHTML = `
                <div class="files-error">

                    <strong>
                        Unable to load project files.
                    </strong>

                    <span>
                        Please try refreshing the page.
                    </span>

                </div>
            `;

        }

    }


    /*
     * Prevent HTML injection when displaying
     * filenames.
     */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
