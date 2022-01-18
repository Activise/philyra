import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { extractAstNode, extractDestinationAndName, setRootFolder } from './cli-util';
import { createPhilyraServices } from '../language/PhilyraModule';
import { PhilyraLanguageMetaData } from '../language/generated/module';
import colors from 'colors';
import path from 'path';
import { Model } from '../language/generated/ast';

export type GenerateOptions = {
    destination?: string;
    root?: string;
}

export const generate = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createPhilyraServices().philyra;
    await setRootFolder(fileName, services, opts.root);
    const domainmodel = await extractAstNode<Model>(fileName, PhilyraLanguageMetaData.fileExtensions, services);
    const generatedDirPath = generateJavaScript(domainmodel, fileName, opts.destination);
    console.log(colors.green(`Java classes generated successfully: ${colors.yellow(generatedDirPath)}`));
};

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);


    // model.entities.forEach(entity => {
    //     console.log(`
    //         @Entity(${entity.tableName ?? entity.name})
    //         public class ${entity.name} {
    //             ${entity.attributes.map(attribute => {
    //                 return `private ${attribute.type.ref?.name} ${attribute.name};`
    //             }).join("\n")}

    //             ${entity.attributes.map(attribute => {
    //                 return `public ${attribute.type.ref?.name} get${attribute.name}() {
    //                     return this.${attribute.name};
    //                 }`
    //             }).join("\n")}

    //             ${entity.attributes.map(attribute => {
    //                 return `private ${attribute.type.ref?.name} set${attribute.name}(${attribute.type.ref?.name} ${attribute.name}) {
    //                     this.${attribute.name} = ${attribute.name};
    //                 }`
    //             }).join("\n")}
    //         }
    //     `);
    // });

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}
