/**
 * UI Utilities for You OS
 */

export const UI = {
    /**
     * Creates a DOM element with specified properties.
     * @param {string} tag - The HTML tag name.
     * @param {Object} props - An object containing properties to set on the element.
     * @returns {HTMLElement} The created element.
     */
    createElement(tag, props = {}) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'className') {
                el.className = value;
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.assign(el.dataset, value);
            } else {
                el[key] = value;
            }
        }
        return el;
    },

    /**
     * Toggles a class on an element.
     * @param {HTMLElement} el - The element.
     * @param {string} className - The class name to toggle.
     */
    toggleClass(el, className) {
        el.classList.toggle(className);
    },

    /**
     * Clears an element's content.
     * @param {HTMLElement} el - The element.
     */
    clear(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
};
