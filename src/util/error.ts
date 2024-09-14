export enum TraceyErrorCode {
  ANALYSIS_ALREADY_STARTED,
  ANALYSIS_NOT_STARTED,
  ANALYSIS_ALREADY_STOPPED,
  TRACEY_NOT_INITIALIZED,
}

export class TraceyError extends Error {
  constructor(
    readonly code: TraceyErrorCode,
    message?: string,
  ) {
    super(message);
  }
}
