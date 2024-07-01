export class KaIndicator {
    private indicators: HTMLElement[] = [];
    private element: HTMLElement;

    constructor(element: HTMLElement = null) {
        this.element = element;
        this.createIndicator();
    }

    private createIndicator() {
        this.destroy();
        const rect = this.element.getBoundingClientRect();
        const positions = ['top', 'right', 'bottom', 'left'];
        positions.forEach(pos => {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            switch (pos) {
                case 'top':
                    div.style.top = `${rect.top}px`;
                    div.style.left = `${rect.left}px`;
                    div.style.width = `${rect.width}px`;
                    div.style.height = '2px';
                    break;
                case 'right':
                    div.style.top = `${rect.top}px`;
                    div.style.left = `${rect.right}px`;
                    div.style.width = '2px';
                    div.style.height = `${rect.height}px`;
                    break;
                case 'bottom':
                    div.style.top = `${rect.bottom}px`;
                    div.style.left = `${rect.left}px`;
                    div.style.width = `${rect.width}px`;
                    div.style.height = '2px';
                    break;
                case 'left':
                    div.style.top = `${rect.top}px`;
                    div.style.left = `${rect.left}px`;
                    div.style.width = '2px';
                    div.style.height = `${rect.height}px`;
                    break;
            }
            document.body.appendChild(div);
            this.indicators.push(div);
        });
    }

    public destroy() {
        this.indicators.forEach(indicator => indicator.remove());
        this.indicators = [];
    }

    public indicate(newElement: HTMLElement) {
        this.element = newElement;
        this.createIndicator();
    }

    public remove() {
        this.destroy();
    }
}
