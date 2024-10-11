# Deployment

To deploy the cloud function, the following command can be used.
Replace the placeholders:

- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_BUCKET_NAME`

```sh
gcloud functions deploy eventsIngress \
  --project GOOGLE_CLOUD_PROJECT_ID \
  --runtime nodejs22 \
  --gen2 \
  --trigger-http \
  --set-env-vars BUCKET_NAME=GOOGLE_CLOUD_BUCKET_NAME \
  --region europe-west3
```

# Local Development

```sh
BUCKET_NAME=bucket_name \
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json \
npm start
```
