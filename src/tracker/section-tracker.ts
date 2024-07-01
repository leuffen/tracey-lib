interface SectionData {
    sectionName: string;
    totalViewTime: number;
    firstViewTime: number;
    scrollCount: number;
    clickCount: number;
    mouseMoveCount: number;
    positions: { index: number; percentage: number }[];
}
export class SectionTracker {
    private sections: HTMLElement[] = [];
    private sectionTimes: Map<HTMLElement, SectionData> = new Map();
    private observer: IntersectionObserver;
    private activeSection: HTMLElement | null = null;
    private lastTimestamp: number = 0;
    private onChangeCallback?: (section: HTMLElement, data: SectionData) => void;
    constructor(selector: string, onChangeCallback?: (section: HTMLElement, data: SectionData) => void) {
        this.sections = Array.from(document.querySelectorAll(selector));
        this.onChangeCallback = onChangeCallback;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = entry.target as HTMLElement;
                const data = this.sectionTimes.get(section) || {
                    sectionName: section.getAttribute('data-tracey-sec-name') || `Section ${this.sections.indexOf(section) + 1}`,
                    totalViewTime: 0,
                    firstViewTime: 0,
                    scrollCount: 0,
                    clickCount: 0,
                    mouseMoveCount: 0,
                    positions: []
                };
                if (entry.isIntersecting) {
                    const now = performance.now();
                    const delta = now - this.lastTimestamp;
                    data.totalViewTime += delta;
                    if (data.scrollCount === 0) {
                        data.firstViewTime += delta;
                    }
                    this.lastTimestamp = now;
                    if (!this.sectionTimes.has(section)) {
                        this.sectionTimes.set(section, data);
                    }
                    if (this.onChangeCallback) {
                        this.onChangeCallback(section, data);
                    }
                }
            });
        }, {
            threshold: 0.5
        });
        this.sections.forEach(section => this.observer.observe(section));
        console.log("SectionTracker initialized with IntersectionObserver");
    }
    public getSectionData(): Map<HTMLElement, SectionData> {
        return this.sectionTimes;
    }
}
