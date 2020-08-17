// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const htmlResponse = require('./html-response');
const buildForm = require('./build-form');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const uploadLimitInMB = parseInt(process.env.UPLOAD_LIMIT_IN_MB);
/*const formHtml = '<html> <head> <meta charset="UTF-8"/></head><body> <form method="POST"> Please' +
    ' Enter Your Name : <input type="text" name="name"/><br/> <input type="submit"/></form></body></html>';

const thanksHtml = '<html> <head> <meta charset="UTF-8"/></head><body> <h1> Thanks</h1> <p> We received your' +
    ' submission.</p>' +
    ' </body></html>';
let response;*/


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

    const apiHost = event.requestContext.domainName,
        prefix = event.requestContext.stage,
        redirectUrl = `https://${apiHost}/${prefix}/confirm`,
        params = {
            Bucket: process.env.UPLOAD_S3_Bucket,
            Expires: 600,
            Conditions: [
                ['content-length-range',1, uploadLimitInMB * 1000000]
            ],
            Fields: {
                success_action_redirect: redirectUrl,
                acl: 'private',
                key: context.awsRequestId + ".jpg"
            }
        },
        form = s3.createPresignedPost(params);
        console.log('Vinodh ' + JSON.stringify(form));
        //console.log('Vinodh 2 ' + htmlResponse(buildForm(form)));
        return htmlResponse(buildForm(form));

};
