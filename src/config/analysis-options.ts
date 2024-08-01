export interface AnalysisOptions {
  /**
   * If set to `true`, an `element-stats-visualizer` will be rendered for this analysis.
   */
  visualize?:
    | boolean
    | {
        enabled: boolean;
        /**
         * Set to `0` to disable the interval.
         */
        interval?: number;
      };
}
