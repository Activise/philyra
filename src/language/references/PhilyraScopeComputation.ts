import { DefaultScopeComputation, LangiumDocument, AstNode, PrecomputedScopes, MultiMap, AstNodeDescription, interruptAndCheck, streamAllContents } from "langium";
import { CancellationToken } from "vscode-languageserver";
import { Model, Import, isEntity, isImport, isPackage, isType, TypeToImport, Attribute } from "../generated/ast";
import { PhilyraServices } from "../PhilyraModule";
import { getMembersToExport, MemberToExport } from "../util/PhilyraAstUtils";
import { PhilyraReferences } from "./PhilyraReferences";

export class PhilyraScopeComputation extends DefaultScopeComputation {
  protected readonly references: PhilyraReferences;

  constructor(services: PhilyraServices) {
    super(services);
    this.references = services.references.CustomReferences;
  }

  async computeScope(document: LangiumDocument<AstNode>, cancelToken: CancellationToken = CancellationToken.None): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Model;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    document.precomputedScopes = scopes;

    await this.processImports(model, scopes, document, cancelToken);
    await this.computeMemberScopes(model, scopes, document, cancelToken);

    return scopes;
  }

  addScopeToContainer(scopes: PrecomputedScopes, container: AstNode, target: AstNode, doccument: LangiumDocument) {
    scopes.add(container, this.descriptions.createDescription(target, this.nameProvider.getName(target)!, doccument));
  }

  async processImports(model: Model, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken) {
    let imports = streamAllContents(model).filter(isImport).toArray();
    for (let imported of imports as Import[]) {
      interruptAndCheck(cancelToken);

      let imports = this.references.findReferenced(TypeToImport, imported.toImport);
      for (let node of imports) {
        if (isPackage(node)) {
          for (let type of getMembersToExport(node)) {
            this.addScopeToContainer(scopes, imported.$container, type, document);
          }
        } else if (isType(node)) {
          this.addScopeToContainer(scopes, imported.$container, node, document); 
        }
      }
    }
  }

  async computeMemberScopes(model: Model, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken): Promise<void> {
    let members = getMembersToExport(model);
    for (let member of members) {
      interruptAndCheck(cancelToken);
      this.addScopeToContainer(scopes, member.$container, member, document);
    }

    await this.computeAttributeScopes(members, scopes, document);
  }

  async computeAttributeScopes(members: MemberToExport[], scopes: PrecomputedScopes, document: LangiumDocument): Promise<void> {
    for (let member of members) {
      if (!isEntity(member)) {
        continue;
      }

      for (let attribute of member.attributes) {
        if (attribute.type == undefined) {
          continue;
        }

        this.addScopeToContainer(scopes, member, attribute, document);
        await this.computeAttributeOtherSideScope(attribute, scopes, document);
      }
    }
  }

  async computeAttributeOtherSideScope(attribute: Attribute, scopes: PrecomputedScopes, document: LangiumDocument): Promise<void> {
    let attributeType = attribute.type.ref;
    if (attributeType && isEntity(attributeType)) {
      for (let targetAttribute of attributeType.attributes) {
        this.addScopeToContainer(scopes, attribute, targetAttribute, document);
      }
    }
  }
}