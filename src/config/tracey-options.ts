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
  };
}
