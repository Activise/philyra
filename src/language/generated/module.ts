/******************************************************************************
 * This file was generated by langium-cli 0.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module, IParserConfig } from 'langium';
import { PhilyraAstReflection } from './ast';
import { PhilyraGrammar } from './grammar';

export const PhilyraLanguageMetaData: LanguageMetaData = {
    languageId: 'philyra',
    fileExtensions: ['.pyl'],
    caseInsensitive: false
};

export const parserConfig: IParserConfig = {
    recoveryEnabled: true,
    nodeLocationTracking: 'full',
    maxLookahead: 3,
};

export const PhilyraGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new PhilyraAstReflection()
};

export const PhilyraGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => PhilyraGrammar(),
    LanguageMetaData: () => PhilyraLanguageMetaData,
    parser: {
        ParserConfig: () => parserConfig
    }
};
