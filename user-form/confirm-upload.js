const htmlResponse = require('./html-response');
const aws = require('aws-sdk');
const s3 = new aws.S3();

exports.lambdaHandler = async (event, context) => {
    console.log(JSON.stringify(event,null,2));

    const params = {
        Bucket: process.env.UPLOAD_S3_Bucket,
        Key: event.queryStringParameters.key,
        Expires: 600,
    };

    const url = s3.getSignedUrl('getObject', params);
    const responseText =
        `
        <html>
        <body>
        <h1>Thanks</h1>
        <a href="${url}">Check your Upload.</a>
        ( The Link Expires in 10 minutes )
        </body>
        </html>
        `;

        form = s3.createPresignedPost(params);
    return htmlResponse(responseText);

};
