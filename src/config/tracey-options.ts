export interface TraceyOptions {
  /**
   * Defines the min-width of the breakpoint in pixels.
   * These are used for reporting the screen size.
   */
  breakpoints: {
    /**
     * The smallest breakpoint.
     */
    base: 0;
    [key: string]: number;
  };
  producers?: {
    mouse?: {
      disabled?: boolean;
      /**
       * @default `defaultThrottleTime`
       */
      throttleTime?: number;
    };
    click?: {
      disabled?: boolean;
    };
    resize?: {
      disabled?: boolean;
    };
    scroll?: {
      disabled?: boolean;
      throttleTime?: number;
    };
    visibilityState?: {
      disabled?: boolean;
    };
    intersection?: {
      disabled?: boolean;
      selectors: string[];
    };
  };
  dataTransfer?: {
    /**
     * URL to the `eventsIngress` cloud function.
     */
    endpoint: string;
    /**
     * @default `defaultDataTransferInterval`
     */
    interval?: number;
    /**
     * @default `defaultDataTransferEventCount`
     */
    minEventCount?: number;
  };
  /**
   * Settings for a random visit ID that will be sent with every event.
   */
  visitId: {
    disabled?: boolean;
  };
}
