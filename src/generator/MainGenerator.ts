// This file is part of the Markdown-to-Starlight converter.
// (c) Ján Regeš <jan.reges@siteone.cz>

import {MarkdownParser} from './MarkdownParser';
import {Section, StructureCreator} from './StructureCreator';
import {SidebarConfigurator} from './SidebarConfigurator';
import {VERSION} from "./Version";
import axios from 'axios';
import fs from "fs";

const colors = require('ansi-colors');

export class MainGenerator {
    private url: string | null = null;
    private filePath: string | null = null;

    constructor(url: string | null, filePath: string | null = null) {
        this.url = url;
        this.filePath = filePath;

        if (!this.url && !this.filePath) {
            const errorMessage = "You must specify either --url or --filePath parameter.";
            console.error(colors.red(errorMessage));
            throw new Error(errorMessage);
        }
    }

    public async generate(): Promise<void> {
        try {
            console.log(colors.yellow("-------------------------------"));
            console.log(colors.yellow("Markdown-to-Starlight converter"));
            console.log(colors.yellow("Version: " + VERSION));
            console.log(colors.yellow("Author: jan.reges@siteone.cz"));
            console.log(colors.yellow("-------------------------------"));

            // load markdown
            let markdown: string;
            if (this.url) {
                const response = await axios.get(this.url);
                markdown = response.data;
            } else if (this.filePath) {
                markdown = fs.readFileSync(this.filePath, 'utf8');
            } else {
                markdown = '';
            }

            // parse markdown content
            const markdownParser = new MarkdownParser();
            const parsedData: Section[] = await markdownParser.parse(markdown);

            // generate dir/file structure
            const structureCreator = new StructureCreator();
            const structure = structureCreator.createStructure(parsedData);

            // generate sidebar config
            const sidebarConfigurator = new SidebarConfigurator();
            sidebarConfigurator.configureSidebar(structure);

            console.log("-------------------------------------");
            console.log(colors.green("Documentation generated successfully!"));
            console.log(colors.green("Now you can copy generated content from `tmp/src/content/docs` and `sidebar` from `tmp/astro.config.mjs` to your Starlight project."));
        } catch (error) {
            console.error(colors.red("Error: " + error));
        }
    }
}
