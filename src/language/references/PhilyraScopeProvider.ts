import { AstNode, AstNodeDescription, DefaultScopeProvider, LangiumServices, Scope, Stream } from "langium";
import { isAttribute, isCrud, isRepository, PhilyraAstReference } from "../generated/ast";

export type ScopeFilter = (node: AstNode, description?: AstNodeDescription) => boolean;

export class FilteredScope implements Scope {
  readonly parentScope: Scope;
  readonly node: AstNode;
  readonly filter?: ScopeFilter;

  constructor(parentScope: Scope, node: AstNode, filter: ScopeFilter | undefined, ignoreGlobalScope: boolean = false) {
    this.parentScope = parentScope;
    this.node = node;
    this.filter = filter;

    if (ignoreGlobalScope) {
      (this.parentScope as any)["outerScope"] = undefined;
    }
  }

  getAllElements(): Stream<AstNodeDescription> {
    let allElements = this.parentScope.getAllElements();
    if (!this.filter) {
      return allElements;
    }

    return allElements.filter(description => this.filter!(this.node, description));
  }
  
  getElement(name: string): AstNodeDescription | undefined {
    let description = this.parentScope.getElement(name);
    if (!this.filter) {
      return description;
    }
    return this.filter!(this.node, description) ? description : undefined;
  }
}

export class PhilyraScopeProvider extends DefaultScopeProvider {
  constructor(services: LangiumServices) {
    super(services);
  }

  getScope(node: AstNode, referenceId: PhilyraAstReference): Scope {
      let result = super.getScope(node, referenceId);
      
      if (isAttribute(node) && referenceId == 'Attribute:otherSide') {
        return new FilteredScope(result, node, attributeScopeFilter);
      } else if (isCrud(node) || isRepository(node)) {
        return new FilteredScope(result, node, undefined, true);
      }

      return result;
  }
}

/**
 * Filters the attribute scope 
 * 
 * @param node The node for the scope
 * @param description The node available for reference
 * @returns true if the referenced nodes type equals the node-scopes type. False if otherwise
 */
const attributeScopeFilter = (node: AstNode, description?: AstNodeDescription): boolean => {
  if (isAttribute(node) && isAttribute(description?.node)) {
    let entity = node.$container;
    
    return entity == description?.node.type.ref; 
  }

  return true;
};