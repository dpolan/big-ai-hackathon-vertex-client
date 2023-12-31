const project = "bigai-hackathon-396013";
const location = "us-central1";

const aiplatform = require("@google-cloud/aiplatform");

// Imports the Google Cloud Prediction service client
const { PredictionServiceClient } = aiplatform.v1;

// Import the helper module for converting arbitrary protobuf.Value objects.
const { helpers } = aiplatform;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
};

const publisher = "google";
const model = "text-bison@001";

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient(clientOptions);

const writeResponseLocally = function (response) {
  console.log(JSON.stringify(response));
};

async function callPredict(prompt) {
  // Configure the parent resource
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
  const instanceValue = helpers.toValue({ prompt: prompt });
  const instances = [instanceValue];

  const parameter = {
    temperature: 0.2,
    maxOutputTokens: 1024,
    topP: 0.8,
    topK: 40,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request
  const response = await predictionServiceClient.predict(request);

  return response;
}

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json({ limit: "50mb" });

const express = require("express");
const app = express();

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://bigcommerce-x-google-bigai-hackathon.mybigcommerce.com"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.options("/*", function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://bigcommerce-x-google-bigai-hackathon.mybigcommerce.com"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.send(200);
});

app.get("/", function (req, res, next) {
  res.send("Permission denied.");
});

app.post("/collector", jsonParser, async function (req, res, next) {
  if (!req.body) {
    return res.sendStatus(400);
  }

  const prediction = await callPredict(req.body.prompt);

  res.send(JSON.stringify(prediction));
});

var server = app.listen(process.env.PORT || 7777, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port);
});
