/**
 * File Explorer Application for You OS
 */
import { UI } from './ui.js';

export class Explorer {
    constructor(vfs) {
        this.vfs = vfs;
        this.currentPath = '/';
    }

    createUI() {
        const container = UI.createElement('div', {
            className: 'explorer-container',
            style: {
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }
        });

        const toolbar = UI.createElement('div', {
            className: 'explorer-toolbar',
            style: {
                padding: '5px',
                background: '#eee',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                borderBottom: '1px solid #ccc'
            }
        });

        const pathInput = UI.createElement('input', {
            style: { flexGrow: 1, padding: '2px 5px' },
            value: this.currentPath
        });

        const goBtn = UI.createElement('button', { textContent: 'Go' });
        goBtn.onclick = () => {
            try {
                this.currentPath = pathInput.value;
                this.renderFiles(container);
            } catch (e) {
                alert(e.message);
            }
        };

        toolbar.appendChild(pathInput);
        toolbar.appendChild(goBtn);
        container.appendChild(toolbar);

        const fileList = UI.createElement('div', {
            className: 'explorer-list',
            style: {
                flexGrow: 1,
                overflowY: 'auto',
                padding: '10px'
            }
        });
        container.appendChild(fileList);

        this.renderFiles(container);

        return container;
    }

    renderFiles(container) {
        const listEl = container.querySelector('.explorer-list');
        UI.clear(listEl);

        try {
            const items = this.vfs.readDir(this.currentPath);
            
            // Add ".." to go up
            if (this.currentPath !== '/') {
                const upItem = UI.createElement('div', { 
                    className: 'explorer-item', 
                    textContent: '..',
                    style: { cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee' }
                });
                upItem.onclick = () => {
                    const parts = this.currentPath.split('/').filter(p => p);
                    parts.pop();
                    this.currentPath = '/' + parts.join('/');
                    if (this.currentPath === '') this.currentPath = '/';
                    this.renderFiles(container);
                };
                listEl.appendChild(upItem);
            }

            items.forEach(item => {
                const itemEl = UI.createElement('div', {
                    className: 'explorer-item',
                    textContent: `${item.type === 'dir' ? '📁' : '📄'} ${item.name}`,
                    style: { cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee' }
                });

                itemEl.onclick = () => {
                    const newPath = this.currentPath === '/' ? `/${item.name}` : `${this.currentPath}/${item.name}`;
                    if (item.type === 'dir') {
                        this.currentPath = newPath;
                        this.renderFiles(container);
                    } else {
                        alert(`File content: 

${this.vfs.readFile(newPath)}`);
                    }
                };
                listEl.appendChild(itemEl);
            });
        } catch (e) {
            listEl.textContent = `Error: ${e.message}`;
        }
    }
}
