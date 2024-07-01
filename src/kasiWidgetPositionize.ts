export type State = {
    widget : {
        element: HTMLElement
        style: CSSStyleDeclaration
        rect: DOMRect
    }
    reference: {
        element: HTMLElement
        style: CSSStyleDeclaration
        rect: DOMRect
    }
}
export type PositionOptions = {
    placement: 'inset' | 'outset';
    position: 'top' | 'bottom' | 'left' | 'right' | 'above' | 'below' | 'auto';
    strategy: 'fixed' | 'absolute';
    modifiers: {
        name: string;
        enabled: boolean;
        fn: (state : State) => void;
    }[] | string[];
}
const defaultModifiers = {
    sameWidth: (state : State) => {
        state.widget.style.width = `${state.reference.rect.width}px`;
    },
    sameHeight: (state : State) => {
        state.widget.style.height = `${state.reference.rect.height}px`;
    }

}
export function ka_position_widget(widgetElement: HTMLElement, referenceElement: HTMLElement, positionOptions: PositionOptions): void {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const parentRect = referenceElement.getBoundingClientRect();
    let widgetRect = widgetElement.getBoundingClientRect();

    let state = {
        widget: {
            element: widgetElement,
            style: {} as CSSStyleDeclaration,
            rect: widgetRect
        },
        reference: {
            element: referenceElement,
            style: {} as CSSStyleDeclaration,
            rect: parentRect
        }
    }

    // Handle cases where the widget's calculated height or width is 0
    if (widgetRect.height === 0 && !widgetElement.style.height) {
        widgetElement.style.height = 'auto';
    }
    if (widgetRect.width === 0 && !widgetElement.style.width) {
        widgetElement.style.width = '100px';
    }
    widgetRect = widgetElement.getBoundingClientRect();
    let top = 0, left = 0;
    switch (positionOptions.placement) {
        case 'inset':
            top = parentRect.top;
            left = parentRect.left;
            break;
        case 'outset':
            top = parentRect.bottom;
            left = parentRect.right;
            break;
    }
    if (widgetRect.height > windowHeight) {
        if (parentRect.top > windowHeight / 2) {
            top = parentRect.top - widgetRect.height;
        } else {
            top = parentRect.bottom;
        }
    } else {
        top = parentRect.bottom;
    }
    if (widgetRect.width > windowWidth) {
        if (parentRect.left > windowWidth / 2) {
            left = parentRect.left - widgetRect.width;
        } else {
            left = parentRect.right;
        }
    } else {
        left = parentRect.right;
    }
    state.widget.style.position = positionOptions.strategy;
    state.widget.style.top = `${top}px`;
    state.widget.style.left = `${left}px`;
    // Apply modifiers
    if (Array.isArray(positionOptions.modifiers)) {
        positionOptions.modifiers.forEach(modifier => {
            if (typeof modifier === 'string') {
                if ( ! defaultModifiers[modifier]) {
                    throw new Error(`Modifier ${modifier} is not a valid modifier`);
                }
                defaultModifiers[modifier](state);
            } else if (modifier.enabled && typeof modifier.fn === 'function') {
                modifier.fn(state);
            }
        });
    }
}

