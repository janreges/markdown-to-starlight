// This file is part of the Markdown-to-Starlight converter.
// (c) Ján Regeš <jan.reges@siteone.cz>

import { MainGenerator } from './generator/MainGenerator';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const generator = new MainGenerator(argv.url, argv.file);
generator.generate();
