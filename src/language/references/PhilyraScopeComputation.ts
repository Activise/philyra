import { DefaultScopeComputation, LangiumServices, LangiumDocument, AstNode, PrecomputedScopes, MultiMap, AstNodeDescription, interruptAndCheck, streamAllContents } from "langium";
import { CancellationToken } from "vscode-languageserver";
import { Model, Import, isPackage, isType, isEntity, isImport } from "../generated/ast";
import { getMembersToExport, MemberToExport } from "../util/PhilyraAstUtils";

export class PhilyraScopeComputation extends DefaultScopeComputation {
  constructor(services: LangiumServices) {
    super(services);
  }

  async computeScope(document: LangiumDocument<AstNode>, cancelToken: CancellationToken = CancellationToken.None): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Model;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    document.precomputedScopes = scopes;

    await this.processImports(model, scopes, document, cancelToken);
    await this.resolveMembers(model, scopes, document, cancelToken);

    // scopes.forEach((val, key) => {
    //   console.log("Key: " + key.$path + " Val: " + val?.name);
    // });
    return scopes;
  }

  async processImports(model: Model, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken) {
    let imports = streamAllContents(model).filter(isImport).toArray();
    for (let imported of imports as Import[]) {
      interruptAndCheck(cancelToken);
      let toImport = imported.toImport.ref;
      if (isPackage(toImport)) {
        for (let type of getMembersToExport(toImport)) {
          scopes.add(imported.$container, this.descriptions.createDescription(type, this.nameProvider.getName(type)!, document));
        }
      } else if (isType(toImport)) {
        scopes.add(imported.$container, this.descriptions.createDescription(toImport, this.nameProvider.getName(toImport)!, document));
      }
    }
  }

  async resolveMembers(model: Model, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken): Promise<void> {
    let members = getMembersToExport(model);
    for (let member of members) {
      interruptAndCheck(cancelToken);
      scopes.add(member.$container, this.descriptions.createDescription(member, this.nameProvider.getName(member)!, document));
    }

    await this.resolveAttributes(members, scopes, document);
  }

  async resolveAttributes(members: MemberToExport[], scopes: PrecomputedScopes, document: LangiumDocument): Promise<void> {
    //let provider = (this.nameProvider as PhilyraNameProvider);
    for (let member of members) {
      if (!isEntity(member)) {
        continue;
      }


      for (let attribute of member.attributes) {
        if (attribute.type == undefined) {
          continue;
        }

        let attributeType = attribute.type.ref;
        if (attributeType && isEntity(attributeType)) {
          for (let targetAttribute of attributeType.attributes) {
            scopes.add(attribute, this.descriptions.createDescription(targetAttribute, targetAttribute.name, document));
          }
        }
      }
    }
  }
}