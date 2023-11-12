// This file is part of the Markdown-to-Starlight converter.
// (c) Ján Regeš <jan.reges@siteone.cz>

import {Section, SubSection, SubSubSection} from "./StructureCreator";

export class MarkdownParser {

    private extractSections(markdown: string): Section[] {
        const lines = markdown.split('\n');
        const sections: Section[] = [];
        let currentSection: Section | null = null;
        let currentSubSection: SubSection | null = null;
        let prevLevelDepth = 0;
        lines.forEach(line => {
            if (line.startsWith('## ')) {
                prevLevelDepth = 2;
                if (currentSubSection) {
                    (currentSection as Section).content.push(currentSubSection);
                }
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {name: line.substring(2).trim(), directContent: '', content: []};
                currentSubSection = null;
            } else if (line.startsWith('### ') && currentSection) {
                prevLevelDepth = 3;
                if (currentSubSection) {
                    (currentSection as Section).content.push(currentSubSection);
                }
                currentSubSection = {name: line.substring(3).trim(), directContent: '', content: []};
            } else if (line.startsWith('#### ') && currentSubSection) {
                prevLevelDepth = 4;
                const subSubSection: SubSubSection = {name: line.substring(4).trim(), content: ''};
                currentSubSection.content.push(subSubSection);
            } else if (currentSubSection && currentSubSection.content.length > 0) {
                line = line.replace('##### ', '#### ').replace('###### ', '##### ');
                currentSubSection.content[currentSubSection.content.length - 1].content += line.trim() + '\n';
            } else if (currentSubSection) {
                currentSubSection.directContent += line.trim() + '\n';
            } else if (currentSection && prevLevelDepth === 2) {
                currentSection.directContent += line + '\n';
            }
        });

        if (currentSection && currentSubSection) {
            (currentSection as Section).content.push(currentSubSection);
        }
        if (currentSection) {
            sections.push(currentSection);
        }

        // if Section has directContent, set this content as first SubSection with name of Section
        sections.forEach(section => {
            if (section.directContent && section.directContent.trim().length > 0) {
                const subSection: SubSection = {name: section.name, directContent: section.directContent, content: []};
                section.directContent = '';
                section.content.unshift(subSection);
            }
        });

        return sections;
    }

    public async parse(markdown: string): Promise<Section[]> {
        try {
            const sections = this.extractSections(markdown);
            return sections;
        } catch (error) {
            console.error('Error loading or parsing Markdown: ', error);
            throw error;
        }
    }
}
