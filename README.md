# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Installation

* `pip install cdk`
* `brew install node`
* `npm install -g npm`
* `npm install -g typescript`
* `npm run build`
* `npm install aws-cdk-lib`

## CLI testing
* add item to DynamoDB using https://httpie.io/docs/cli:
    `http POST https://xxx.lambda-url.region.on.aws < files/data.json`
