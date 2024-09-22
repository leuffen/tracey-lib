const functions = require("@google-cloud/functions-framework");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * HTTP function that supports CORS requests.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http("eventsIngress", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
  } else if (req.method === "POST") {
    try {
      let events = [];
      try {
        events = JSON.parse(req.body);
      } catch (err) {
        res.set("x-tracey-error", "body-parse-error");
        res.status(400).send();
        return;
      }

      if (!Array.isArray(events)) {
        res.set("x-tracey-error", "no-events-array");
        res.status(400).send();
        return;
      }

      if (events.length === 0) {
        res.set("x-tracey-error", "empty-events-array");
        res.status(200).send();
        return;
      }

      const sessionId = getSessionId(req);
      const date = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .replaceAll(".", "-");
      const fileName = `tracey${sessionId ? "-" + sessionId : ""}-${date}.json`;
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: "application/json",
        },
      });

      stream.on("error", (err) => {
        console.error("Error uploading file:", err);
        res.set("x-tracey-error", "file-upload-error");
        res.status(500).send();
      });

      stream.on("finish", () => {
        res.status(200).send();
      });

      const data = {
        events,
        sessionId,
        headers: getHeaderValues(req),
      };
      stream.end(JSON.stringify(data));
    } catch (err) {
      res.set("x-tracey-error", err.message);
      res.status(500).send();
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
});

/**
 * @param {Request} req
 * @return {string|undefined}
 */
function getSessionId(req) {
  return req.query.s || undefined;
}

/**
 * @param {Request} req
 * @return {Record<string, string>}
 */
function getHeaderValues(req) {
  const headerNames = [
    "User-Agent",
    "Sec-Ch-Ua",
    "Sec-Ch-Ua-Mobile",
    "Sec-Ch-Ua-Platform",
  ];
  const headers = {};
  headerNames.forEach((name) => {
    if (req.get(name)) {
      headers[name] = req.get(name);
    }
  });

  return headers;
}
