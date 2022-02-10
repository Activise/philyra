import Handlebars from "handlebars";
import { startLanguageServer } from 'langium';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createPhilyraServices } from './PhilyraModule';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const { shared } = createPhilyraServices({ connection });


Handlebars.registerHelper("capitalize", (input: string) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
});

// Start the language server with the language-specific services
startLanguageServer(shared);
