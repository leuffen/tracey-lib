gcloud functions deploy eventsIngress \
  --project leuffen-tracey-dev \
  --runtime nodejs22 \
  --gen2 \
  --trigger-http \
  --set-env-vars BUCKET_NAME=tracey-dev-data \
  --region europe-west3
