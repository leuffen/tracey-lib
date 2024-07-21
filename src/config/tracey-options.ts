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
  disableProducers?: {
    click?: boolean;
    resize?: boolean;
  };
}
