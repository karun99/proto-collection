/**
 * Virtual File System (VFS) for You OS
 */

export class VFS {
    constructor() {
        this.root = this._loadFileSystem();
        this.currentPath = '/';
    }

    _loadFileSystem() {
        const saved = localStorage.getItem('youos_vfs');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default file system structure
        return {
            '/': {
                type: 'dir',
                children: {
                    'home': {
                        type: 'dir',
                        children: {
                            'guest': {
                                type: 'dir',
                                children: {
                                    'readme.txt': {
                                        type: 'file',
                                        content: 'Welcome to You OS!

This is a virtual environment.

Try using the Terminal or Text Editor to explore.'
                                    },
                                    'notes.txt': {
                                        type: 'file',
                                        content: 'Don't forget to complete the project!'
                                    }
                                }
                            }
                        }
                    },
                    'etc': {
                        type: 'dir',
                        children: {
                            'os-release': {
                                type: 'file',
                                content: 'You OS v1.0.0
Kernel: JS-Kernel-0.1'
                            }
                        }
                    }
                }
            }
        };
    }

    save() {
        localStorage.setItem('youos_vfs', JSON.stringify(this.root));
    }

    _resolvePath(path) {
        if (path === '/') return this.root['/'];
        
        const parts = path.split('/').filter(p => p);
        let current = this.root['/'];

        for (const part of parts) {
            if (part === '..') {
                // This is a simplification. Proper parent tracking is needed for '..'
                // For now, we'll handle '..' in the shell/explorer layer or implement a proper tree.
                continue; 
            }
            if (current.type === 'dir' && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }
        return current;
    }

    // Simple helper to get the parent of a path
    _getParentPath(path) {
        if (path === '/') return '/';
        const parts = path.split('/').filter(p => p);
        parts.pop();
        const parentPath = '/' + parts.join('/');
        return parentPath === '//' ? '/' : parentPath;
    }

    readDir(path) {
        const dir = this._resolvePath(path);
        if (dir && dir.type === 'dir') {
            return Object.keys(dir.children).map(name => ({
                name,
                type: dir.children[name].type
            }));
        }
        throw new Error('Path is not a directory');
    }

    readFile(path) {
        const file = this._resolvePath(path);
        if (file && file.type === 'file') {
            return file.content;
        }
        throw new Error('File not found');
    }

    writeFile(path, content) {
        const parentPath = this._getParentPath(path);
        const fileName = path.split('/').pop();
        const parentDir = this._resolvePath(parentPath);

        if (parentDir && parentDir.type === 'dir') {
            parentDir.children[fileName] = {
                type: 'file',
                content: content
            };
            this.save();
            return true;
        }
        throw new Error('Invalid directory path');
    }

    mkdir(path) {
        const parentPath = this._getParentPath(path);
        const folderName = path.split('/').pop();
        const parentDir = this._resolvePath(parentPath);

        if (parentDir && parentDir.type === 'dir') {
            parentDir.children[folderName] = {
                type: 'dir',
                children: {}
            };
            this.save();
            return true;
        }
        throw new Error('Invalid directory path');
    }

    rm(path) {
        const parentPath = this._getParentPath(path);
        const name = path.split('/').pop();
        const parentDir = this._resolvePath(parentPath);

        if (parentDir && parentDir.type === 'dir' && parentDir.children[name]) {
            delete parentDir.children[name];
            this.save();
            return true;
        }
        throw new Error('Item not found');
    }
}
