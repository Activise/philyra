import { startLanguageServer } from 'langium';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createPhilyraServices } from './PhilyraModule';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const { shared } = createPhilyraServices({ connection });

// Start the language server with the language-specific services
startLanguageServer(shared);





import Handlebars from "handlebars";
const template = Handlebars.compile("Name: {{name}}");
console.log(template({ name: "Nils" }));
