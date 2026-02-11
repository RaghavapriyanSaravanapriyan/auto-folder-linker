# **Auto Folder Linker for Obsidian**

**Auto Folder Linker** is an Obsidian plugin that automatically indexes and links files inside each folder to its corresponding **Folder Note**, using Obsidian-style wikilinks (`[[ ]]`).

It is designed to work alongside the official **Folder Notes** plugin from the Obsidian Community Plugins store.

---

## How it works

When used together with **Folder Notes**, this plugin:

* Detects your folder notes automatically
* Scans the folder and all its **subfolders recursively**
* Adds wikilinks for every file inside that folder to the folder note
* Keeps links updated as files are added, renamed, or removed

This makes your Graph View more structured and meaningful without requiring manual linking.

---

## Requirements

You **must have the Folder Notes plugin installed and enabled** from Obsidian Community Plugins for this plugin to function correctly.

Install it from:
`Settings → Community Plugins → Browse → Search: "Folder Notes"`

---

## Important notes

* If **Folder Notes is not installed or disabled**, indexing may be incomplete or inconsistent.
* The plugin relies on the folder note naming convention used by Folder Notes (for example, `MyFolder/MyFolder.md`).
* If you modify settings inside Folder Notes, you may need to re-run indexing for best results.

---

## Features

* Automatic linking of files to folder notes
* Recursive scanning of subfolders
* Supports Markdown files, PDFs, and other text-based files
* Keeps folder notes synchronized with your file structure
* Designed for research vaults, academic notes, and personal knowledge systems

---

## Why this plugin?

If your vault contains many nested folders, manually linking files to folder notes can become tedious and error-prone. This plugin automates that process and keeps your structure clean and connected.

It is particularly useful for:

* Students
* Researchers
* Developers
* Zettelkasten or PKM users
* Anyone maintaining a large Obsidian vault

---

## Contributing

Issues, feature requests, and pull requests are welcome on GitHub.

---

## License

MIT

