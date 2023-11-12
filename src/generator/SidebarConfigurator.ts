// This file is part of the Markdown-to-Starlight converter.
// (c) Ján Regeš <jan.reges@siteone.cz>

import fs from 'fs';
import path from 'path';

export interface SidebarItem {
    name: string;
    filePath: string;
}

export interface SidebarSection {
    label: string;
    items: SidebarItem[];
    directory: string;
}

export class SidebarConfigurator {
    private configPath: string;

    constructor() {
        this.configPath = path.join(__dirname, '../../tmp/astro.config.mjs');
    }

    public configureSidebar(structure: SidebarSection[]): void {
        const sidebarConfig = structure.map(section => ({
            label: section.label,
            items: section.items.map(item => ({
                label: item.name,
                link: `${item.filePath.replace(/\.md$/, '')}`
            })),
        }));

        const configContent = `export default {
      sidebar: ${JSON.stringify(sidebarConfig, null, 2)}
    };`;

        fs.writeFileSync(this.configPath, configContent);
    }
}
