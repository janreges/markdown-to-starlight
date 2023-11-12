// This file is part of the Markdown-to-Starlight converter.
// (c) Ján Regeš <jan.reges@siteone.cz>

import fs from 'fs';
import path from 'path';
import {SidebarItem, SidebarSection} from "./SidebarConfigurator";

const colors = require('ansi-colors');

export interface SubSubSection {
    name: string;
    content: string;
}

export interface SubSection {
    name: string;
    directContent: string;
    content: SubSubSection[];
}

export interface Section {
    name: string;
    directContent: string;
    content: SubSection[];
}


export class StructureCreator {
    private rootDir: string;

    constructor() {
        this.rootDir = path.join(__dirname, '../../tmp/src/content/docs');
    }

    private createDirIfNotExists(dir: string): void {
        console.log(`Creating dir ${dir}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
    }

    public createStructure(parsedData: Section[]): SidebarSection[] {
        const sidebarSections: SidebarSection[] = [];

        parsedData.forEach((section, sectionIndex) => {
            // for variant with number prefix:const sectionDirName = this.sanitizePath(`${sectionIndex + 1}-${section.name}`);
            const sectionDirName = this.sanitizeFilename(section.name);
            const sectionDir = path.join(this.rootDir, sectionDirName).replace(/\\/g, '/');
            this.createDirIfNotExists(sectionDir);

            const sidebarItems: SidebarItem[] = [];

            section.content.forEach((subSection, subSectionIndex) => {
                // for variant with number prefix: const subSectionFileName = this.sanitizePath(`${subSectionIndex + 1}-${subSection.name}.md`);
                const subSectionFileName = this.sanitizeFilename(subSection.name + '.md');
                const subSectionFile = path.join(sectionDir, subSectionFileName).replace(/\\/g, '/');
                console.log(`Creating file ${subSectionFile}`);

                let content = `---\n`;
                content += `title: ${subSection.name}\n`;

                // take description only if it starts with capital letter - it is probably a sentence
                if (subSection.directContent && subSection.directContent.trim().match(/^[A-Z]/)) {
                    let description = subSection.directContent.replace(/\s+/g, ' ').replace(/[*#_:"'`-]+/g, ' ').replace(/\s+/g, ' ').trim();
                    if (description.length > 250) {
                        content += `description: ${description.substring(0, 250)}...\n`;
                    } else {
                        content += `description: ${description}\n`;
                    }
                }
                content += `---\n\n`;
                if (subSection.directContent) {
                    content += subSection.directContent + '\n';
                }
                subSection.content.forEach(subSubSection => {
                    content += `## ${subSubSection.name}\n\n`;
                    content += subSubSection.content;
                });

                this.createDirIfNotExists(sectionDir);
                fs.writeFileSync(subSectionFile, content);

                sidebarItems.push({
                    name: subSection.name,
                    filePath: path.join(sectionDirName, subSectionFileName).replace('\\', '/')
                });
            });

            sidebarSections.push({
                label: section.name,
                items: sidebarItems,
                directory: sectionDirName
            });
        });

        return sidebarSections;
    }

    private sanitizeFilename(path: string): string {
        return path.trim()
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, '-')
            .replace('-.md', '.md')
            .replace(/^-|-$/g, '');
    }
}
