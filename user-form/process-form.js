// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const htmlResponse = require('./html-response')
const aws = require('aws-sdk');
const s3 = new aws.S3();


const formHtml = '<html> <head> <meta charset="UTF-8"/></head><body> <form method="POST"> Please' +
    ' Enter Your Name : <input type="text" name="name"/><br/> <input type="submit"/></form></body></html>';


let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
    console.log(JSON.stringify(event,null,2));
    const bucketName = process.env.UPLOAD_S3_BUCKET;
    await s3.putObject(
        {
            Bucket: bucketName,
            Key: context.awsRequestId,
            Body: JSON.stringify(event)
        }
    ).promise();

    const thanksHtml = `
            <html> 
                <head> 
                    <meta charset="UTF-8"/>
                </head>
                <body> 
                    <h1> Thanks</h1> 
                    <p> We received your submissions.</p> 
                    <p> Reference: ${context.awsRequestId}</p>
                </body>
            </html>
`;

    return htmlResponse(thanksHtml);
};
