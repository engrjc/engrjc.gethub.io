/*
============================================================
JC ENGINEERING
AUTOMATIC PROJECT FILE SYSTEM
============================================================

Repository:
engrjc/engrjc.github.io

Branch:
main

Project folders:

Files/Cctv/
Files/Microwave/
Files/PCB/
Files/Electronics/

The system automatically searches each folder recursively.

You can add new files to GitHub without changing the
HTML page.

============================================================
*/


document.addEventListener("DOMContentLoaded", function () {

    /*
    ============================================================
    GITHUB CONFIGURATION
    ============================================================
    */

    const GITHUB_OWNER = "engrjc";

    const GITHUB_REPOSITORY =
        "engrjc.github.io";

    const GITHUB_BRANCH =
        "main";


    /*
    ============================================================
    SUPPORTED FILE TYPES
    ============================================================
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

        ".dwg",
        ".dxf",

        ".zip",
        ".rar"

    ];


    /*
    ============================================================
    FIND ALL AUTOMATIC PROJECT FILE CONTAINERS
    ============================================================
    */

    const containers =
        document.querySelectorAll(
            "[data-project-files]"
        );


    if (!containers.length) {
        return;
    }


    /*
    ============================================================
    GET FILE EXTENSION
    ============================================================
    */

    function getExtension(filename) {

        const lastDot =
            filename.lastIndexOf(".");

        if (lastDot === -1) {
            return "";
        }

        return filename
            .substring(lastDot)
            .toLowerCase();
    }


    /*
    ============================================================
    CHECK SUPPORTED FILE
    ============================================================
    */

    function isSupportedFile(filename) {

        const extension =
            getExtension(filename);

        return SUPPORTED_FILES.includes(
            extension
        );
    }


    /*
    ============================================================
    FILE TYPE LABEL
    ============================================================
    */

    function getFileType(filename) {

        const extension =
            getExtension(filename);


        if (extension === ".pdf") {
            return "PDF";
        }


        if (
            extension === ".png" ||
            extension === ".jpg" ||
            extension === ".jpeg" ||
            extension === ".webp" ||
            extension === ".gif" ||
            extension === ".svg"
        ) {
            return "IMAGE";
        }


        if (
            extension === ".doc" ||
            extension === ".docx"
        ) {
            return "DOC";
        }


        if (
            extension === ".xls" ||
            extension === ".xlsx"
        ) {
            return "XLS";
        }


        if (
            extension === ".ppt" ||
            extension === ".pptx"
        ) {
            return "PPT";
        }


        if (extension === ".dwg") {
            return "DWG";
        }


        if (extension === ".dxf") {
            return "DXF";
        }


        if (
            extension === ".zip" ||
            extension === ".rar"
        ) {
            return "ZIP";
        }


        if (extension === ".txt") {
            return "TXT";
        }


        return "FILE";
    }


    /*
    ============================================================
    CLEAN DISPLAY NAME
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
    ENCODE GITHUB PATH
    ============================================================
    */

    function encodeGitHubPath(path) {

        return path
            .split("/")
            .map(function (part) {

                return encodeURIComponent(
                    part
                );

            })
            .join("/");
    }


    /*
    ============================================================
    CREATE GITHUB API URL
    ============================================================
    */

    function createApiUrl(path) {

        return (
            "https://api.github.com/repos/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/contents/" +
            encodeGitHubPath(path) +
            "?ref=" +
            encodeURIComponent(
                GITHUB_BRANCH
            )
        );
    }


    /*
    ============================================================
    CREATE GITHUB WEB URL
    ============================================================
    */

    function createGitHubUrl(path) {

        return (
            "https://github.com/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/blob/" +
            GITHUB_BRANCH +
            "/" +
            encodeGitHubPath(path)
        );
    }


    /*
    ============================================================
    CREATE RAW FILE URL
    ============================================================
    */

    function createRawUrl(path) {

        return (
            "https://raw.githubusercontent.com/" +
            GITHUB_OWNER +
            "/" +
            GITHUB_REPOSITORY +
            "/" +
            GITHUB_BRANCH +
            "/" +
            encodeGitHubPath(path)
        );
    }


    /*
    ============================================================
    LOAD DIRECTORY
    ============================================================
    */

    async function loadDirectory(path) {

        const url =
            createApiUrl(path);


        const response =
            await fetch(
                url,
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
                "GitHub API returned HTTP " +
                response.status +
                ". " +
                responseText
            );
        }


        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "GitHub returned invalid JSON."
            );
        }


        if (!Array.isArray(data)) {

            throw new Error(
                "The GitHub API did not return a folder."
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


        let files = [];


        for (
            const entry
            of entries
        ) {


            /*
            ----------------------------------------------------
            FILE
            ----------------------------------------------------
            */

            if (
                entry.type === "file"
            ) {

                if (
                    isSupportedFile(
                        entry.name
                    )
                ) {

                    files.push(
                        entry
                    );
                }

                continue;
            }


            /*
            ----------------------------------------------------
            FOLDER
            ----------------------------------------------------
            */

            if (
                entry.type === "dir"
            ) {

                const nestedFiles =
                    await findFiles(
                        entry.path
                    );


                files =
                    files.concat(
                        nestedFiles
                    );
            }

        }


        return files;
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

        const type =
            getFileType(
                file.name
            );


        const displayName =
            cleanFileName(
                file.name
            );


        const githubUrl =
            createGitHubUrl(
                file.path
            );


        const rawUrl =
            createRawUrl(
                file.path
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "automatic-file-card";


        /*
        --------------------------------------------------------
        FILE TYPE
        --------------------------------------------------------
        */

        const typeElement =
            document.createElement(
                "div"
            );


        typeElement.className =
            "automatic-file-type";


        typeElement.textContent =
            type;


        /*
        --------------------------------------------------------
        INFORMATION
        --------------------------------------------------------
        */

        const information =
            document.createElement(
                "div"
            );


        information.className =
            "automatic-file-information";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "automatic-file-title";


        title.textContent =
            displayName;


        title.title =
            file.name;


        const filename =
            document.createElement(
                "div"
            );


        filename.className =
            "automatic-file-name";


        filename.textContent =
            file.name;


        /*
        --------------------------------------------------------
        ACTIONS
        --------------------------------------------------------
        */

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "automatic-file-actions";


        /*
        --------------------------------------------------------
        OPEN BUTTON
        --------------------------------------------------------
        */

        const openButton =
            document.createElement(
                "a"
            );


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
        VIEW RAW FILE
        --------------------------------------------------------
        */

        const viewButton =
            document.createElement(
                "a"
            );


        viewButton.className =
            "automatic-file-button";


        viewButton.href =
            rawUrl;


        viewButton.target =
            "_blank";


        viewButton.rel =
            "noopener noreferrer";


        viewButton.textContent =
            "VIEW";


        /*
        --------------------------------------------------------
        ASSEMBLE
        --------------------------------------------------------
        */

        information.appendChild(
            title
        );


        information.appendChild(
            filename
        );


        actions.appendChild(
            openButton
        );


        actions.appendChild(
            viewButton
        );


        card.appendChild(
            typeElement
        );


        card.appendChild(
            information
        );


        card.appendChild(
            actions
        );


        return card;
    }


    /*
    ============================================================
    LOAD PROJECT
    ============================================================
    */

    async function loadProject(
        container
    ) {

        const folder =
            container.getAttribute(
                "data-project-files"
            );


        const list =
            container.querySelector(
                "[data-file-list]"
            );


        const count =
            container.querySelector(
                "[data-file-count]"
            );


        if (
            !folder ||
            !list
        ) {
            return;
        }


        /*
        --------------------------------------------------------
        LOADING
        --------------------------------------------------------
        */

        list.innerHTML = `
            <div class="automatic-files-loading">
                Loading project files...
            </div>
        `;


        try {

            /*
            ----------------------------------------------------
            SEARCH GITHUB FOLDER
            ----------------------------------------------------
            */

            let files =
                await findFiles(
                    folder
                );


            /*
            ----------------------------------------------------
            SORT
            ----------------------------------------------------
            */

            files =
                sortFiles(
                    files
                );


            /*
            ----------------------------------------------------
            EMPTY
            ----------------------------------------------------
            */

            if (
                files.length === 0
            ) {

                list.innerHTML = `
                    <div class="automatic-files-empty">
                        No project files found in
                        <strong>
                            ${escapeHtml(folder)}
                        </strong>.
                    </div>
                `;


                if (count) {

                    count.textContent =
                        "0 project files";

                }


                return;
            }


            /*
            ----------------------------------------------------
            CLEAR LOADING
            ----------------------------------------------------
            */

            list.innerHTML =
                "";


            /*
            ----------------------------------------------------
            CREATE CARDS
            ----------------------------------------------------
            */

            files.forEach(
                function (file) {

                    const card =
                        createFileCard(
                            file
                        );


                    list.appendChild(
                        card
                    );

                }
            );


            /*
            ----------------------------------------------------
            COUNT
            ----------------------------------------------------
            */

            if (count) {

                count.textContent =
                    files.length +
                    (
                        files.length === 1
                            ? " project file"
                            : " project files"
                    );

            }


            console.log(
                "Automatic project files:",
                folder,
                files
            );


        } catch (error) {

            console.error(
                "Automatic project file error:",
                error
            );


            list.innerHTML = `
                <div class="automatic-files-error">

                    <strong>
                        Unable to load project files.
                    </strong>

                    <span>
                        ${escapeHtml(
                            error.message
                        )}
                    </span>

                </div>
            `;


            if (count) {

                count.textContent =
                    "Unable to load files";

            }

        }

    }


    /*
    ============================================================
    START ALL PROJECT LOADERS
    ============================================================
    */

    containers.forEach(
        function (container) {

            loadProject(
                container
            );

        }
    );

});
