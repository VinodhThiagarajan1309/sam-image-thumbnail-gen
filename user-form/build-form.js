module.exports = function buildform(form) {
    const fieldNames = Object.keys(form.fields);
    const fields = fieldNames.map(field => `<input type= "hidden" name="${field}" value="${form.fields[field]}"/>`)
        .join('\n');

    const responseText = `<html>
        <head>
        <meta http-equiv="Content-Type" content="text/html"; charset="UTF-8"/>
        </head>
        <body>
            <form action="${form.url}" method="post" enctype="multipart/form-data">
                ${fields} 
                Select an image File:
                <input type="file" name="file" accept="image/png, image/jpeg , image/jpg, image/gif"/> </br>
                <input type="submit" name="submit" value="Upload File"/>       
            </form>
        </body>
    </html>`;

    console.log('Mrithula ' + responseText);

    return responseText;


};