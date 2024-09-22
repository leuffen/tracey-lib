const functions = require("@google-cloud/functions-framework");
const { Storage } = require("@google-cloud/storage");
const { format } = require("util");
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
      const jsonData = req.body;

      if (!jsonData) {
        res.status(400).send({ error: "Invalid or missing JSON data" });
        return;
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\..+/, "");
      const fileName = `data-${timestamp}.json`;

      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: "application/json",
        },
      });

      stream.on("error", (err) => {
        console.error("Error uploading file:", err);
        res.status(500).send({ error: err.message });
      });

      stream.on("finish", () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        );
        res.status(200).send({ publicUrl });
      });

      const jsonStr = JSON.stringify(jsonData);
      stream.end(jsonStr);
    } catch (err) {
      console.error("Error processing request:", err);
      res.status(500).send({ error: err.message });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
});
