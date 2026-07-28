/**
 * Kernel for You OS
 */
import { UI } from './ui.js';
import { WindowManager } from './window-manager.js';

class Kernel {
    constructor() {
        this.desktop = document.getElementById('desktop');
        this.startMenuBtn = document.getElementById('start-menu-button');
        this.startMenu = document.getElementById('start-menu');
        this.appItems = document.querySelectorAll('.app-item');
        
        this.windowManager = new WindowManager(this.desktop);
        this.state = {
            user: 'Guest User',
            isStartMenuOpen: false,
            apps: []
        };

        this.init();
    }

    init() {
        this._setupEventListeners();
        console.log('You OS Kernel Initialized');
    }

    _setupEventListeners() {
        // Start menu toggle
        this.startMenuBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        };

        // Close start menu when clicking desktop
        this.desktop.onclick = () => {
            if (this.state.isStartMenuOpen) {
                this.toggleStartMenu();
            }
        };

        // App launching
        this.appItems.forEach(item => {
            item.onclick = () => {
                const appType = item.dataset.app;
                this.launchApp(appType);
                this.toggleStartMenu();
            };
        });

        // System actions
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                alert('Logout functionality coming soon!');
            };
        }

        const shutdownBtn = document.getElementById('shutdown-button');
        if (shutdownBtn) {
            shutdownBtn.onclick = () => {
                if (confirm('Are you sure you want to shutdown?')) {
                    document.body.innerHTML = '<div style="color: white; display: flex; justify-content: center; align-items: center; height: 100vh; background: black;">Shutting down...</div>';
                }
            };
        }
    }

    toggleStartMenu() {
        this.state.isStartMenuOpen = !this.state.isStartMenuOpen;
        if (this.state.isStartMenuOpen) {
            this.startMenu.classList.remove('hidden');
        } else {
            this.startMenu.classList.add('hidden');
        }
    }

    launchApp(type) {
        console.log(`Launching app: ${type}`);
        const content = UI.createElement('div');
        
        switch (type) {
            case 'explorer':
                content.textContent = 'File Explorer is under construction.';
                this.windowManager.createWindow('File Explorer', content);
                break;
            case 'terminal':
                content.textContent = 'Terminal is under construction.';
                this.windowManager.createWindow('Terminal', content);
                break;
            case 'editor':
                content.textContent = 'Text Editor is under construction.';
                this.windowManager.createWindow('Text Editor', content);
                break;
            default:
                content.textContent = 'Unknown application.';
                this.windowManager.createWindow('Error', content);
        }
    }
}

// Initialize the OS
window.addEventListener('DOMContentLoaded', () => {
    new Kernel();
});
