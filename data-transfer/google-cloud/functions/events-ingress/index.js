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
functions.http("eventsIngress", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  switch (req.method) {
    case "OPTIONS":
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).send("");
      break;
    case "GET":
      await handleGet(req, res);
      break;
    case "POST":
      await handlePost(req, res);
      break;
    default:
      res.status(405).send("Method Not Allowed");
      break;
  }
});

async function handleGet(req, res) {
  const visitId = getVisitId(req);
  if (!visitId) {
    res.set("x-tracey-error", "visit-id-missing");
    res.status(400).send();
    return;
  }

  const [filesMeta] = await bucket.getFiles({
    prefix: `tracey-${visitId}`,
  });

  const files = [];

  for (const file of filesMeta) {
    if (file.name.endsWith(".json")) {
      const trace = await downloadTraceFileContent(file);
      files.push(trace);
    }
  }

  res.status(200).json({
    vid: visitId,
    files,
  });
}

async function handlePost(req, res) {
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

    const visitId = getVisitId(req);
    const date = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .replaceAll(".", "-");
    const fileName = `tracey${visitId ? "-" + visitId : ""}-${date}.json`;
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
      visitId,
      headers: getHeaderValues(req),
    };
    stream.end(JSON.stringify(data), async () => {
      if (req.query.public === "true") {
        await file.makePublic();
      }
    });
  } catch (err) {
    res.set("x-tracey-error", err.message);
    res.status(500).send();
  }
}

/**
 * @param {Request} req
 * @return {string|undefined}
 */
function getVisitId(req) {
  return req.query.vid || undefined;
}

/**
 * @param {Request} req
 * @return {Record<string, string>}
 */
function getHeaderValues(req) {
  const headerNames = [
    "Referer",
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

/**
 *
 * @param {import('@google-cloud/storage').File} file
 * @return {Promise<{
 *   name: string,
 *   data: any
 * }>}
 */
async function downloadTraceFileContent(file) {
  const fileStream = file.createReadStream();

  let data = "";
  fileStream.on("data", (chunk) => {
    data += chunk;
  });

  return new Promise((resolve, reject) => {
    fileStream.on("end", () => {
      try {
        resolve({
          name: file.name,
          data: JSON.parse(data),
        });
      } catch (err) {
        reject(err);
      }
    });

    fileStream.on("error", (err) => {
      reject(err);
    });
  });
}
