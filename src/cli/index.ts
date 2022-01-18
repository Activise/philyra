import { Command } from 'commander';
import { PhilyraLanguageMetaData } from '../language/generated/module';
import { generate } from './generator';

const program = new Command();

program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${PhilyraLanguageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .option('-r, --root <dir>', 'source root folder')
    .description('generates Java classes by Entity description')
    .action(generate);

program.parse(process.argv);
