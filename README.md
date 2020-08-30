# Server Less Application Model

## Build Sample App:

[https://aws.amazon.com/serverless/build-a-web-app/](https://aws.amazon.com/serverless/build-a-web-app/)

## Server-less Link:

[https://aws.amazon.com/serverless/](https://aws.amazon.com/serverless/)

## Spec Link:

[https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

## Contribution:

[https://github.com/aws/aws-toolkit-jetbrains/issues/1649](https://github.com/aws/aws-toolkit-jetbrains/issues/1649)

## Available SAM Resources

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled.png)

## Will be initially learning

```makefile
AWS::Serverless::Api - Common Name - ApiGateway
AWS::Serverless::Application
AWS::Serverless::Function - Common Name - Lambda
~~AWS::Serverless::HttpApi ( Api is Enough for now)~~
AWS::Serverless::LayerVersion
AWS::Serverless::SimpleTable
~~AWS::Serverless::StateMachine ( Right Now Not Learning Step Functions)~~
```

## Very Basic SAM Template

```java
Transform: AWS::Serverless-2016-10-31

Globals:
  set of globals

Description:
  String

Metadata:
  template metadata

Parameters:
  set of parameters

Mappings:
  set of mappings

Conditions:
  set of conditions

Resources:
  set of resources

Outputs:
  set of outputs
```

## Organize Later

- AWS::Serverless::Api - This is what you need and not the HTTP Api - Right now the difference I know is that HTTP doesn't mention connecting to other AWS Services other than Lambda while Api does and REST  is HTTPS
- Link to upgrade Swagger for AWS - [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-api-gateway-extensions.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-api-gateway-extensions.html)
- [https://github.com/Mermade/openapi-gui](https://github.com/Mermade/openapi-gui)
- We see `/Prod` because SAM automatically creates this stage and add it - the right term to use here is `implicit API` , since we have this API configured in the Event property of the Lambda, hence the name.
- Talk about cold starts // TODO
- `context.awsRequestId` is a useful uuid that help track lambda calls // TODO
- Mention about capturing outputs // TODO
- Talk about Timeout // TODO
- When creating subfolders in the main sam folder alway run `npm init --yes` and then begin the code. // TODO
- Lambda Retries - We can use the `MaximumRetryAttempts and MinimumRetryAttempts` parameters with `EventInvokeConfiguration` in SAM

### Sam Command

```makefile
### Build, Package and Ship

sam build
sam package --s3-bucket sam-app-dep --output-template-file output.yaml
sam deploy --template-file output.yaml --stack-name sam-test-1 --capabilities CAPABILITY_IAM

### Get Live Logs For the Stack
sam logs -n HelloWorldFunction --stach-name sam-test-1 --tail

### Local Test an API
sam local start-api
http://127.0.0.1:3000/hello/ - Skip the Stage name here

### Local Test a LAMBDA which doesn't have a API end point
sam local invoke HelloWorldFunction --event events/event.json
( Capture the event in using the logging, then tail using the tail command, get the sample event , store it in events.json file and then invoke the above command)

### Debug Lambda, right now supports, Go, Python and Nodejs
sam local invoke HelloWorldFunction --event events/event.json -d 8070
(use chrome://inspect command )
Use the 
Use the `Command + P` option and look for the file and in our case it is app.js
Use the watch option and add the variables you want to add in there

Gives you an idea like this

REPORT RequestId: a3a29263-236a-1759-6d1f-b899f2d93946  Init Duration: 31695.98 ms      Duration: 210765.62 ms  Billed Duration: 210800 ms      Memory Size: 128 MB     Max Memory Used: 43 MB
```

Step 1

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%201.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%201.png)

Step 2

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%202.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%202.png)

### Linting

Install 

```makefile
pip3 install cfn-lint

Then run 

cfn-lint 

Dont forget YAMLLINT

sam validate
```

## Lambda

```makefile
 # To get a lambda function configuration
aws lambda get-function-configuration --function-name sam-test-1-HelloWorldFunction-85U89D3XIR6D

# To get the physical resource id mentioned in the above line, List the stack resources 
aws cloudformation list-stack-resources --stack-name sam-test-1

# To get the latest version
aws lambda get-function-configuration --function-name sam-test-1-HelloWorldFunction-85U89D3XIR6D --output text --query Version ( remember the quey language from chapter 3) 

```

## Lambda Alias

Achieved using the `AutoPublishAlias` property and you can name it anything like `dev`, `stage` and `prod`

```makefile
HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery1Minute
```

```makefile
## To list all the versions of the given lambda
aws lambda list-versions-by-function --function-name sam-test-1-HelloWorldFunction-85U89D3XIR6D
```

> so when you create a Lambda and assign an API event invocation, the API(event) will call the alias/recent version. This happens because they in the same template.yaml. But if you want to call it from outside then you can include the version name following the function name like `sam-test-1-HelloWorldFunction-85U89D3XIR6D:4` the 4 here  the version of the Lambda we would like to call

### Invoke Any version of Lambda

```makefile
aws lambda invoke --function-name sam-test-1-HelloWorldFunction-85U89D3XIR6D:2 output.txt
```

### Gradual Deployment

Achieved using `DeploymentPreference` property

Useful Links:

- [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)
- [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-function-deploymentpreference.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-function-deploymentpreference.html)

```makefile
HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery1Minute

```

## Code Deploy Console

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%203.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%203.png)

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%204.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%204.png)

## Cloud Watch alarm setting

- Helps during Gradual deployment
- Raises alarm if things go
- Set up an alarm and assign the same to Lambda deployment
- Can also set up custom metrics using Math and come up with alarms like,
    - Drop in Sales
    - Or Decreased LIKES

```makefile
## Setting up the alarm
HelloWorldErrors:
    Type: AWS::CloudWatch::Alarm
    Properties:
      MetricName: Errors
      Statistic: Sum
      ComparisonOperator: GreaterThanThreshold
      Threshold: 5
      Period: 60
      EvaluationPeriods: 1
      TreatMissingData: notBreaching
      Namespace: AWS/Lambda
      Dimensions:
        - Name: FunctionName
          Value: !Ref HelloWorldFunction
```

Mapping the alarm to the Lambda function during deployment

```makefile
HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery1Minute
        Alarms:
          - !Ref HelloWorldErrors
      Events:
        HelloWorld:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello
            Method: get
```

### More on DeploymentPreference

DeploymentPreference also has the following properties

- `Hooks` - Execute Pre and Post deployment Lambda

    ```makefile
    Hooks:
      PreTraffic:
        Ref: PreTrafficLambdaFunction
      PostTraffic:
        Ref: PostTrafficLambdaFunction
    ```

### API Gateway

So when you configure the event in the Lambda for API we get something called as Implicit API, this is the one that gives `/Prod` as the default stage, but if you want to have more control over this then we need to go for the SAM resource `AWS::Serverless::Api` resource and you can refer them in the Lambda using the `RestApiId` property like below

```makefile
WebApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref AppStage

  HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs12.x
      AutoPublishAlias: live
      #DeploymentPreference:
        #Type: Linear10PercentEvery1Minute
        #Alarms:
          #- !Ref HelloWorldErrors
      Events:
        HelloWorld:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello
            Method: get
            RestApiId: !Ref WebApi
        Submission:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello
            Method: post
            RestApiId: !Ref WebApi
```

## Parameters Usage

We can also override the default `/Prod` using the `Parameter` template and refer to the usage of `AppStage` above,

```makefile
Parameters:
  AppStage:
    Type: String
    Default: api
```

Also we can override this parameter when you call the `sam deploy` using the following option `--parameter-overrides` AppStage = api AppName=Demo.

We can also add more constraints that restricts these parameter values ( like the name can be only numerical etc)

## Generating Test Events

When you want to write test cases and you want to know how a test will look like

```makefile
sam local generate-event --help
```

### Dealing with bad messages

This is called dead letter queue config

- SQS - Batch
- SNS  - Instant

The Lambda Terminology to be used is called Lambda Destinations (from November 2019 onwards)

Use the Dead Letter Queue Property `DeadLetterQueue`

Sample 

```makefile
ConvertFileFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: image-conversion/
      Handler: index.handler
      Runtime: nodejs12.x
      AutoPublishAlias: live
        #DeploymentPreference:
        #Type: Linear10PercentEvery1Minute
      #Alarms:
      #- !Ref HelloWorldErrors
      Events:
        FileUploaded:
          Type: S3 # More info about API Event Source: https://github
          Properties:
            Bucket: !Ref UploadS3Bucket
            Events: s3:ObjectCreated:*
      Timeout: 600
      Environment:
        Variables:
          OUTPUT_BUCKET: !Ref ThumbnailsS3Bucket
      Policies:
        - S3FullAccessPolicy:
            BucketName: !Ref ThumbnailsS3Bucket
      DeadLetterQueue:
        Type: SNS
        TargetArn: !Ref NotifyAdmins
```

```makefile
## This is the setup to receive the Lambda errors
NotifyAdmins:
    Type: AWS::SNS::Topic
```

## Reduce Email Noice using Conditional resources

- Setup Conditional Parameters

```makefile
ContactEmailAddress:
  Type: String
  Description: Email address for operational notifications
  Default: ''
```

- Setup Condition based on the parameter

```makefile
Conditions:
  ContactEmailSet: !Not [ !Equals ['', !Ref ContactEmailAddress]]

```

- Map this condition against a resource

```makefile
AlarmNotifyOpsSubscription:
    Type: AWS::SNS::Subscription
    Condition: ContactEmailSet
    Properties:
      EndPoint: !Ref ContactEmailAddress
      Protocol: emai;
      TopicArn: !Ref NotifyAdmins
```

- During deploy set this Parameter

Post effects of the above steps

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%205.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%205.png)

Confirm it

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%206.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%206.png)

When Deploying we can override the parameters like this

```makefile
sam deploy --template-file output.yaml --stack-name sam-test-1 --capabilities CAPABILITY_IAM --parameter-overrides ContactEmailAddress=myemail@gmail.com
```

Create an error and expect a mail like this

![Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%207.png](Server%20Less%20Application%20Model%206c2c08e848fc4a7e8e0ab48c6d97e5c6/Untitled%207.png)

## Commands for this project
```
sam build
sam package --s3-bucket sam-app-dep --output-template-file output.yaml
sam deploy --template-file output.yaml --stack-name sam-test-1 --capabilities CAPABILITY_IAM
 CAPABILITY_AUTO_EXPAND --parameter-overrides ContactEmailAddress=xxxxxxx@gmail.com
```