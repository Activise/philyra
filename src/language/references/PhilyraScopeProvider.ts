import { AstNode, AstNodeDescription, DefaultScopeProvider, LangiumServices, Scope, Stream } from "langium";
import { isAttribute } from "../generated/ast";

export type ScopeFilter = (node: AstNode, description?: AstNodeDescription) => boolean;

export class FilteredScope implements Scope {
  readonly parentScope: Scope;
  readonly node: AstNode;
  readonly filter: ScopeFilter;

  constructor(parentScope: Scope, node: AstNode, filter: ScopeFilter) {
    this.parentScope = parentScope;
    this.node = node;
    this.filter = filter;
  }

  getAllElements(): Stream<AstNodeDescription> {
    return this.parentScope.getAllElements().filter(description => this.filter(this.node, description));
  }
  
  getElement(name: string): AstNodeDescription | undefined {
    let description = this.parentScope.getElement(name);
    return this.filter(this.node, description) ? description : undefined;
  }
}

export class PhilyraScopeProvider extends DefaultScopeProvider {
  constructor(services: LangiumServices) {
    super(services);
  }

  getScope(node: AstNode, referenceId: string): Scope {
      let result = super.getScope(node, referenceId);
      
      if (isAttribute(node)) {
        return new FilteredScope(result, node, attributeScopeFilter);
      }

      return result;
  }
}

const attributeScopeFilter = (node: AstNode, description?: AstNodeDescription): boolean => {
  if (isAttribute(node) && isAttribute(description?.node)) {
    let entity = node.$container;
    
    return entity == description?.node.type.ref; 
  }

  return true;
};