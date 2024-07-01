


export interface TraceyConfig {
    breakpoints?: {
        [key: string]: number
    }

    // How to select sections (for detailed section analytics)
    sections_selector?: string


}


export interface TraceyInterface {

}


let tracey_default = {
    breakpoints: {
        // Bootstrap breakpoints
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
    },
    sections_selector: "section"
} as TraceyConfig;



declare global {
    interface Window {
        tracey_config: TraceyConfig
        tracey: TraceyInterface
    }
}


// Merge with existing window.tracey object
window.tracey_config = window.tracey_config || {};
window.tracey_config = {...tracey_default, ...window.tracey_config};
