import { DefaultAstNodeDescriptionProvider, LangiumServices, LangiumDocument, AstNode, AstNodeDescription, isNamed } from "langium";
import { CancellationToken } from "vscode-languageserver";
import { Model } from "../generated/ast";
import { PhilyraNameProvider } from "../references/PhilyraNameProvider";
import { getMembersToExport } from "../util/PhilyraAstUtils";

export class PhilyraAstNodeDescriptionProvider extends DefaultAstNodeDescriptionProvider {
  constructor(services: LangiumServices) {
    super(services);
  }

  async createDescriptions(document: LangiumDocument<AstNode>, cancelToken?: CancellationToken): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    const model = document.parseResult.value as Model;

    let members = [...model.packages, ...getMembersToExport(model)];
    for (let member of members) {
      if (!isNamed(member)) {
        continue;
      }

      const name = (this.nameProvider as PhilyraNameProvider).getQualifiedName(member.$container, member.name);
      descr.push(this.createDescription(member, name, document));
    }

    return descr;
  }
}