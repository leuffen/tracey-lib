import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { AnySerializedEvent } from "../events/serialized-event";
import { DataTransferQueryParams } from "./query-params";

export async function downloadTrace(
  visitId: string,
  options: TraceyOptions & SharedOptions,
): Promise<AnySerializedEvent[]> {
  if (!options?.dataTransfer?.endpoint) {
    throw new Error("dataTransfer.endpoint is required");
  }

  const url = new URL(options.dataTransfer.endpoint);
  url.searchParams.set(DataTransferQueryParams.VISIT_ID, visitId);

  const res = await fetch(url.toString());
  const data = (await res.json()) as {
    vid: string;
    files: {
      name: string;
      data: {
        events: AnySerializedEvent[];
        headers: unknown;
      };
    }[];
  };

  return data.files.flatMap((f) => f.data.events);
}
