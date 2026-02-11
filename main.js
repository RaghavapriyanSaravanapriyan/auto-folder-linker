const { Plugin, TFile, TFolder } = require('obsidian');

module.exports = class AutoFolderLinker extends Plugin {
    async onload() {
        console.log('Loading Auto Folder Linker plugin');

        // Command to manually re-index
        this.addCommand({
            id: 're-index-all-folder-notes',
            name: 'Re-index all folder notes',
            callback: () => {
                this.updateAllFolderNotes();
            }
        });

        // Event Listeners for automatic updates
        // We trigger updates for all parent folders of the affected file
        this.registerEvent(
            this.app.vault.on('create', (file) => {
                this.handleFileChange(file);
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file instanceof TFile) {
                    this.handleFileChange(file);
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                this.handleFileChange(file);
                // Note: oldPath updates are trickier, but triggered by the new path usually covers the current graph state.
            })
        );

        // Initial scan when plugin loads
        this.app.workspace.onLayoutReady(() => {
            this.updateAllFolderNotes();
        });
    }

    onunload() {
        console.log('Unloading Auto Folder Linker plugin');
    }

    /**
     * When a file changes, we update all parent folder notes that might be indexing it.
     */
    async handleFileChange(file) {
        let currentParent = file.parent;
        // Traverse up the tree and update every parent that has a folder note
        while (currentParent) {
            await this.updateFolderNote(currentParent);
            currentParent = currentParent.parent;
        }
    }

    async updateAllFolderNotes() {
        const root = this.app.vault.getRoot();
        await this.scanFolderRecursive(root);
    }

    async scanFolderRecursive(folder) {
        if (!(folder instanceof TFolder)) return;

        await this.updateFolderNote(folder);

        for (const child of folder.children) {
            if (child instanceof TFolder) {
                await this.scanFolderRecursive(child);
            }
        }
    }

    /**
     * Recursively collects all files under a folder.
     */
    getAllFilesRecursive(folder, filesList = []) {
        for (const child of folder.children) {
            if (child instanceof TFile) {
                const ext = (child.extension || '').toLowerCase();
                if (['md', 'txt', 'pdf'].includes(ext)) {
                    filesList.push(child);
                }
            } else if (child instanceof TFolder) {
                this.getAllFilesRecursive(child, filesList);
            }
        }
        return filesList;
    }

    /**
     * Checks if a folder has a corresponding Folder Note and updates it with all files (recursive).
     */
    async updateFolderNote(folder) {
        if (!folder || !(folder instanceof TFolder)) return;

        // Note name = Folder Name, inside the folder
        const folderNoteName = `${folder.name}.md`;
        const folderNote = folder.children.find(
            (child) => child instanceof TFile && child.name === folderNoteName
        );

        if (!folderNote) {
            return;
        }

        // Deep Indexing: Collect all files under this folder recursively
        const allFiles = this.getAllFilesRecursive(folder);

        // Filter out the folder note itself from the list
        const filteredFiles = allFiles.filter(file => file.path !== folderNote.path);

        // Sort files alphabetically by basename
        filteredFiles.sort((a, b) => a.basename.localeCompare(b.basename));

        // Create the links block with [[wikilinks]]
        // Note: Using file.path or file.basename. 
        // Obsidian graph view works best with paths if names are non-unique, 
        // but [[basename]] is standard if names are unique. 
        // To be safe for Graph View and standard markdown, [[file_path]] is often used if not in same folder.
        // However, standard Wikilink behavior often prefers just the name if unique.
        let linksBlock = `## 📄 Files in this folder (Recursive)\n`;
        if (filteredFiles.length === 0) {
            linksBlock += `*No matching files found recursive.*\n`;
        } else {
            for (const file of filteredFiles) {
                // We use [[path]] to ensure it works deep in the graph
                linksBlock += `[[${file.path}|${file.name}]]\n`;
            }
        }

        // Read existing content
        const content = await this.app.vault.read(folderNote);

        // Handle Content Preservation (above divider ---)
        const lines = content.split('\n');
        let dividerIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                dividerIndex = i;
                break;
            }
        }

        let newContent = "";
        if (dividerIndex !== -1) {
            const preserved = lines.slice(0, dividerIndex).join('\n');
            newContent = `${preserved.trimEnd()}\n\n---\n\n${linksBlock}`;
        } else {
            newContent = `${content.trimEnd()}\n\n---\n\n${linksBlock}`;
        }

        if (newContent !== content) {
            await this.app.vault.modify(folderNote, newContent);
        }
    }
};
