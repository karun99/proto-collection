/**
 * Terminal Application for You OS
 */
import { UI } from './ui.js';

export class Terminal {
    constructor(vfs) {
        this.vfs = vfs;
        this.currentPath = '/home/guest';
        this.history = [];
        this.inputBuffer = '';
    }

    createUI() {
        const container = UI.createElement('div', {
            className: 'terminal-container',
            style: {
                backgroundColor: 'black',
                color: '#00ff00',
                fontFamily: 'monospace',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                overflowY: 'auto'
            }
        });

        const output = UI.createElement('div', { className: 'terminal-output' });
        const inputLine = UI.createElement('div', { 
            className: 'terminal-input-line', 
            style: { display: 'flex', gap: '10px' } 
        });

        const prompt = UI.createElement('span', { 
            textContent: `guest@youos:${this.currentPath}$ ` 
        });
        
        const input = UI.createElement('input', {
            className: 'terminal-input',
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                color: '#00ff00',
                fontFamily: 'monospace',
                outline: 'none',
                flexGrow: 1
            }
        });

        inputLine.appendChild(prompt);
        inputLine.appendChild(input);
        container.appendChild(output);
        container.appendChild(inputLine);

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                this._executeCommand(cmd, output, prompt);
                input.value = '';
            }
        };

        return container;
    }

    _executeCommand(cmd, outputEl, promptEl) {
        if (!cmd) return;

        // Print command to output
        const cmdLine = UI.createElement('div', { 
            textContent: `guest@youos:${this.currentPath}$ ${cmd}` 
        });
        outputEl.appendChild(cmdLine);

        const [baseCmd, ...args] = cmd.split(' ');
        let result = '';

        try {
            switch (baseCmd) {
                case 'help':
                    result = 'Available commands: ls, cd, cat, mkdir, rm, clear, pwd, help';
                    break;
                case 'ls':
                    const files = this.vfs.readDir(this.currentPath);
                    result = files.map(f => `${f.type === 'dir' ? '[DIR] ' : '      '} ${f.name}`).join('
');
                    break;
                case 'pwd':
                    result = this.currentPath;
                    break;
                case 'cd':
                    const target = args[0] || '/home/guest';
                    if (target === '..') {
                        const parts = this.currentPath.split('/').filter(p => p);
                        parts.pop();
                        this.currentPath = '/' + parts.join('/');
                        if (this.currentPath === '') this.currentPath = '/';
                    } else if (target === '~') {
                        this.currentPath = '/home/guest';
                    } else {
                        // Simple absolute/relative path resolution
                        let fullPath = target.startsWith('/') ? target : (this.currentPath === '/' ? `/${target}` : `${this.currentPath}/${target}`);
                        fullPath = fullPath.replace(/\/+$/, ''); // remove trailing slash
                        if (fullPath === '') fullPath = '/';
                        
                        // Validate if it's a directory
                        const dir = this.vfs.readDir(fullPath); // will throw if not dir
                        this.currentPath = fullPath;
                    }
                    result = '';
                    break;
                case 'cat':
                    const filePath = args[0] ? (args[0].startsWith('/') ? args[0] : `${this.currentPath}/${args[0]}`) : null;
                    if (!filePath) {
                        result = 'Usage: cat <filename>';
                    } else {
                        result = this.vfs.readFile(filePath);
                    }
                    break;
                case 'mkdir':
                    const dirPath = args[0] ? (args[0].startsWith('/') ? args[0] : `${this.currentPath}/${args[0]}`) : null;
                    if (!dirPath) {
                        result = 'Usage: mkdir <dirname>';
                    } else {
                        this.vfs.mkdir(dirPath);
                        result = `Directory ${args[0]} created.`;
                    }
                    break;
                case 'rm':
                    const rmPath = args[0] ? (args[0].startsWith('/') ? args[0] : `${this.currentPath}/${args[0]}`) : null;
                    if (!rmPath) {
                        result = 'Usage: rm <name>';
                    } else {
                        this.vfs.rm(rmPath);
                        result = `Removed ${args[0]}.`;
                    }
                    break;
                case 'clear':
                    outputEl.innerHTML = '';
                    result = '';
                    break;
                default:
                    result = `Command not found: ${baseCmd}. Type 'help' for list.`;
            }
        } catch (e) {
            result = `Error: ${e.message}`;
        }

        if (result) {
            const resLine = UI.createElement('div', { textContent: result });
            outputEl.appendChild(resLine);
        }

        promptEl.textContent = `guest@youos:${this.currentPath}$ `;
        outputEl.scrollTop = outputEl.scrollHeight;
    }
}
