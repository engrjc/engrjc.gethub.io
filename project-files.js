/* =========================================================
   JC ENGINEERING
   AUTOMATIC PROJECT FILE SYSTEM
   ========================================================= */


.automatic-files {
    width: 100%;
    margin-top: 15px;
}


.automatic-file-list {
    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 7px;
}


.automatic-file-card {
    display: grid;

    grid-template-columns:
        42px minmax(0, 1fr) auto;

    align-items: center;

    gap: 10px;

    min-width: 0;

    padding: 9px;

    background: #f8fafc;

    border: 1px solid #dfe7ed;

    border-radius: 5px;

    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}


.automatic-file-card:hover {
    background: #ffffff;

    border-color: #8ecff2;
}


.automatic-file-type {
    display: flex;

    align-items: center;

    justify-content: center;

    width: 38px;

    height: 30px;

    color: #1684c6;

    background: #edf7fc;

    border: 1px solid #bcd9e9;

    border-radius: 4px;

    font-size: 8px;

    font-weight: 800;

    letter-spacing: 0.5px;
}


.automatic-file-information {
    min-width: 0;
}


.automatic-file-title {
    overflow: hidden;

    color: #30485d;

    font-size: 9px;

    font-weight: 700;

    text-overflow: ellipsis;

    white-space: nowrap;
}


.automatic-file-name {
    margin-top: 2px;

    overflow: hidden;

    color: #8493a0;

    font-size: 7px;

    text-overflow: ellipsis;

    white-space: nowrap;
}


.automatic-file-actions {
    display: flex;

    gap: 5px;
}


.automatic-file-button {
    display: inline-flex;

    align-items: center;

    justify-content: center;

    padding: 5px 7px;

    color: #1684c6;

    background: #ffffff;

    border: 1px solid #1684c6;

    border-radius: 3px;

    font-size: 7px;

    font-weight: 700;

    text-decoration: none;

    white-space: nowrap;
}


.automatic-file-button:hover {
    color: #ffffff;

    background: #1684c6;
}


.automatic-files-loading {
    padding: 11px;

    color: #607484;

    background: #f4f8fb;

    border: 1px solid #dce7ee;

    border-radius: 5px;

    font-size: 9px;

    line-height: 1.5;
}


.automatic-files-empty {
    padding: 11px;

    color: #697b89;

    background: #f8fafc;

    border: 1px solid #dfe7ed;

    border-radius: 5px;

    font-size: 9px;

    line-height: 1.5;
}


.automatic-files-error {
    display: flex;

    flex-direction: column;

    gap: 5px;

    padding: 11px;

    color: #8a3434;

    background: #fff5f5;

    border: 1px solid #edcccc;

    border-radius: 5px;

    font-size: 9px;

    line-height: 1.5;
}


.automatic-files-error strong {
    font-size: 9px;
}


.automatic-file-count {
    margin-top: 7px;

    color: #71808e;

    font-size: 8px;
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 700px) {

    .automatic-file-list {
        grid-template-columns: 1fr;
    }

}


@media (max-width: 500px) {

    .automatic-file-card {
        grid-template-columns:
            38px minmax(0, 1fr);

        gap: 8px;
    }


    .automatic-file-actions {
        grid-column: 2;

        margin-top: 2px;
    }

}
