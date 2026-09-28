/*
============================================================
JC ENGINEERING
AUTOMATIC PROJECT FILE LOADER
============================================================

This script automatically searches GitHub project folders.

Example:

Files/Cctv/
Files/Microwave/
Files/PCB/
Files/Electronics/

You can add new files later without editing the HTML.

============================================================
*/


document.addEventListener("DOMContentLoaded", function () {

    const fileContainers =
        document.querySelectorAll("[data-project-files]");

    if (!fileContainers.length) {
        return;
    }


    /*
    ============================================================
    GITHUB CONFIGURATION
    ============================================================
    */

    const GITHUB_OWNER = "engrjc";
    const GITHUB_REPOSITORY = "engrjc.github.io";
    const GITHUB_BRANCH = "main";


    /*
    ============================================================
    FILE EXTENSIONS
    ============================================================

    These are the file types that can be displayed.

    You can add more extensions here in the future.
    */

    const SUPPORTED_FILES = [
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".gif",
        ".svg",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".txt",
        ".zip",
        ".rar",
        ".dwg",
        ".dxf"
    ];


    /*
    ============================================================
    FILE ICONS
    ============================================================
    */

    function getFileType(extension) {

        switch (extension) {

            case ".pdf":
                return "PDF";

            case ".png":
            case ".jpg":
            case ".jpeg":
            case ".webp":
            case ".gif":
            case ".svg":
                return "IMAGE";

            case ".doc":
            case ".docx":
                return "DOC";

            case ".xls":
            case ".xlsx":
                return "XLS";

            case ".ppt":
            case ".pptx":
                return "PPT";

            case ".dwg":
                return "DWG";

            case ".dxf":
                return "DXF";

            case ".zip":
                return "ZIP";

            case ".rar":
                return "RAR";

            case ".txt":
                return "TXT";

            default:
                return "FILE";
        }
    }


    /*
    ============================================================
    GET FILE EXTENSION
    ============================================================
    */

    function getExtension(filename) {

        const dot =
            filename.lastIndexOf(".");

        if (dot === -1) {
            return "";
        }

        return filename
            .substring(dot)
            .toLowerCase();
    }


    /*
    ============================================================
    ESCAPE HTML
    ============================================================
    */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /*
    ============================================================
    FORMAT FILE NAME
    ============================================================
    */

    function cleanFileName(filename) {

        return filename
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    /*
    ============================================================
    CREATE GITHUB URL
    ============================================================
    */

    function createGitHubUrl(path) {

        const encodedPath =
            path
                .split("/")
                .map(function (part) {
                    return encodeURIComponent(part);
                })
                .join("/");


        return (
            "https://github.com/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/blob/" +
            GITHUB_BRANCH +
            "/" +
            encodedPath
        );
    }


    /*
    ============================================================
    CREATE RAW URL
    ============================================================
    */

    function createRawUrl(path) {

        const encodedPath =
            path
                .split("/")
                .map(function (part) {
                    return encodeURIComponent(part);
                })
                .join("/");


        return (
            "https://raw.githubusercontent.com/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/" +
            GITHUB_BRANCH +
            "/" +
            encodedPath
        );
    }


    /*
    ============================================================
    CREATE API URL
    ============================================================
    */

    function createApiUrl(path) {

        const encodedPath =
            path
                .split("/")
                .map(function (part) {
                    return encodeURIComponent(part);
                })
                .join("/");


        return (
            "https://api.github.com/repos/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/contents/" +
            encodedPath +
            "?ref=" +
            encodeURIComponent(GITHUB_BRANCH)
        );
    }


    /*
    ============================================================
    CHECK SUPPORTED FILE
    ============================================================
    */

    function isSupportedFile(filename) {

        const extension =
            getExtension(filename);

        return SUPPORTED_FILES.includes(extension);
    }


    /*
    ============================================================
    LOAD DIRECTORY
    ============================================================
    */

    async function loadDirectory(path) {

        const apiUrl =
            createApiUrl(path);


        const response =
            await fetch(
                apiUrl,
                {
                    method: "GET",
                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/vnd.github+json"
                    }
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                "GitHub API HTTP " +
                response.status +
                ": " +
                responseText
            );
        }


        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                "GitHub returned invalid JSON."
            );
        }


        if (!Array.isArray(data)) {

            throw new Error(
                "GitHub did not return a directory listing."
            );
        }


        return data;
    }


    /*
    ============================================================
    RECURSIVE FILE SEARCH
    ============================================================
    */

    async function findFiles(path) {

        const entries =
            await loadDirectory(path);


        let results = [];


        for (const entry of entries) {

            /*
            ----------------------------------------------------
            FILE
            ----------------------------------------------------
            */

            if (entry.type === "file") {

                if (
                    isSupportedFile(entry.name)
                ) {

                    results.push(entry);
                }

                continue;
            }


            /*
            ----------------------------------------------------
            DIRECTORY
            ----------------------------------------------------
            */

            if (entry.type === "dir") {

                const nestedFiles =
                    await findFiles(entry.path);


                results =
                    results.concat(
                        nestedFiles
                    );
            }

        }


        return results;
    }


    /*
    ============================================================
    SORT FILES
    ============================================================
    */

    function sortFiles(files) {

        return files.sort(
            function (a, b) {

                return a.path.localeCompare(
                    b.path,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );

            }
        );
    }


    /*
    ============================================================
    CREATE FILE CARD
    ============================================================
    */

    function createFileCard(file) {

        const extension =
            getExtension(file.name);


        const fileType =
            getFileType(extension);


        const displayName =
            cleanFileName(file.name);


        const githubUrl =
            createGitHubUrl(file.path);


        const rawUrl =
            createRawUrl(file.path);


        const card =
            document.createElement("div");


        card.className =
            "automatic-file-card";


        /*
        --------------------------------------------------------
        File type
        --------------------------------------------------------
        */

        const type =
            document.createElement("div");


        type.className =
            "automatic-file-type";


        type.textContent =
            fileType;


        /*
        --------------------------------------------------------
        File information
        --------------------------------------------------------
        */

        const information =
            document.createElement("div");


        information.className =
            "automatic-file-information";


        const title =
            document.createElement("div");


        title.className =
            "automatic-file-title";


        title.textContent =
            displayName;


        title.title =
            file.name;


        const filename =
            document.createElement("div");


        filename.className =
            "automatic-file-name";


        filename.textContent =
            file.name;


        /*
        --------------------------------------------------------
        Buttons
        --------------------------------------------------------
        */

        const actions =
            document.createElement("div");


        actions.className =
            "automatic-file-actions";


        const openButton =
            document.createElement("a");


        openButton.className =
            "automatic-file-button";


        openButton.href =
            githubUrl;


        openButton.target =
            "_blank";


        openButton.rel =
            "noopener noreferrer";


        openButton.textContent =
            "OPEN";


        /*
        --------------------------------------------------------
        Download link
        --------------------------------------------------------
        */

        const rawButton =
            document.createElement("a");


        rawButton.className =
            "automatic-file-button automatic-file-download";


        rawButton.href =
            rawUrl;


        rawButton.target =
            "_blank";


        rawButton.rel =
            "noopener noreferrer";


        rawButton.textContent =
            "VIEW";


        /*
        --------------------------------------------------------
        Assemble
        --------------------------------------------------------
        */

        information.appendChild(title);

        information.appendChild(filename);


        actions.appendChild(openButton);

        actions.appendChild(rawButton);


        card.appendChild(type);

        card.appendChild(information);

        card.appendChild(actions);


        return card;
    }


    /*
    ============================================================
    LOAD ONE PROJECT CONTAINER
    ============================================================
    */

    async function loadProjectFiles(container) {

        const folder =
            container.getAttribute(
                "data-project-files"
            );


        if (!folder) {
            return;
        }


        const countElement =
            container.querySelector(
                "[data-file-count]"
            );


        const listElement =
            container.querySelector(
                "[data-file-list]"
            );


        if (!listElement) {
            return;
        }


        /*
        --------------------------------------------------------
        Loading message
        --------------------------------------------------------
        */

        listElement.innerHTML =
            `
            <div class="automatic-files-loading">
                Loading project files...
            </div>
            `;


        try {

            /*
            ----------------------------------------------------
            Find files recursively
            ----------------------------------------------------
            */

            let files =
                await findFiles(folder);


            files =
                sortFiles(files);


            /*
            ----------------------------------------------------
            Empty folder
            ----------------------------------------------------
            */

            if (!files.length) {

                listElement.innerHTML =
                    `
                    <div class="automatic-files-empty">
                        No project files found in
                        <strong>${escapeHtml(folder)}</strong>.
                    </div>
                    `;


                if (countElement) {

                    countElement.textContent =
                        "0 project files";

                }

                return;
            }


            /*
            ----------------------------------------------------
            Display files
            ----------------------------------------------------
            */

            listElement.innerHTML =
                "";


            files.forEach(
                function (file) {

                    const card =
                        createFileCard(file);


                    listElement.appendChild(card);

                }
            );


            /*
            ----------------------------------------------------
            File count
            ----------------------------------------------------
            */

            if (countElement) {

                countElement.textContent =
                    files.length +
                    (
                        files.length === 1
                            ? " project file"
                            : " project files"
                    );

            }


            console.log(
                "Automatic project files loaded:",
                folder,
                files
            );


        } catch (error) {

            console.error(
                "Project file loader error:",
                error
            );


            listElement.innerHTML =
                `
                <div class="automatic-files-error">

                    <strong>
                        Unable to load project files.
                    </strong>

                    <span>
                        ${escapeHtml(error.message)}
                    </span>

                </div>
                `;


            if (countElement) {

                countElement.textContent =
                    "File loading error";

            }

        }

    }


    /*
    ============================================================
    LOAD ALL PROJECT CONTAINERS
    ============================================================
    */

    fileContainers.forEach(
        function (container) {

            loadProjectFiles(
                container
            );

        }
    );

});
