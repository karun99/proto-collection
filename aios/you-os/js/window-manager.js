/**
 * Window Manager for You OS
 */
import { UI } from './ui.js';

export class WindowManager {
    constructor(desktopElement) {
        this.desktop = desktopElement;
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 10;
    }

    /**
     * Creates and displays a new window.
     * @param {string} title - The title of the window.
     * @param {HTMLElement} content - The content of the window.
     * @returns {HTMLElement} The window element.
     */
    createWindow(title, content) {
        const windowEl = UI.createElement('div', {
            className: 'window',
            style: {
                top: '50px',
                left: '50px',
                width: '400px',
                height: '300px'
            }
        });

        const header = UI.createElement('div', { className: 'window-header' });
        const titleEl = UI.createElement('span', { 
            className: 'window-title', 
            textContent: title 
        });

        const controls = UI.createElement('div', { className: 'window-controls' });
        const closeBtn = UI.createElement('button', { 
            className: 'window-control-btn close',
            textContent: '✕'
        });

        closeBtn.onclick = () => this.closeWindow(windowEl);

        controls.appendChild(closeBtn);
        header.appendChild(titleEl);
        header.appendChild(controls);

        const contentEl = UI.createElement('div', { className: 'window-content' });
        contentEl.appendChild(content);

        windowEl.appendChild(header);
        windowEl.appendChild(contentEl);

        this.desktop.appendChild(windowEl);
        
        const windowObj = {
            el: windowEl,
            header: header,
            title: title,
            content: contentEl
        };

        this.windows.push(windowObj);
        this._makeDraggable(windowEl, header);
        this._setupFocus(windowEl);

        this.focusWindow(windowEl);

        return windowEl;
    }

    closeWindow(windowEl) {
        this.windows = this.windows.filter(w => w.el !== windowEl);
        windowEl.remove();
        if (this.activeWindow === windowEl) {
            this.activeWindow = null;
        }
    }

    focusWindow(windowEl) {
        if (this.activeWindow) {
            this.activeWindow.el.style.zIndex = 10;
        }
        this.activeWindow = windowEl;
        this.zIndexCounter++;
        windowEl.style.zIndex = this.zIndexCounter;
    }

    _makeDraggable(windowEl, header) {
        let isDragging = false;
        let offsetX, offsetY;

        header.onmousedown = (e) => {
            isDragging = true;
            this.focusWindow(windowEl);
            
            offsetX = e.clientX - windowEl.offsetLeft;
            offsetY = e.clientY - windowEl.offsetTop;

            document.onmousemove = (e) => {
                if (!isDragging) return;
                windowEl.style.left = `${e.clientX - offsetX}px`;
                windowEl.style.top = `${e.clientY - offsetY}px`;
            };

            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    _setupFocus(windowEl) {
        windowEl.onmousedown = () => {
            this.focusWindow(windowEl);
        };
    }
}
