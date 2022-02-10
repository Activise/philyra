import { AbstractSemanticTokenProvider, AstNode, SemanticTokenAcceptor } from "langium";
import { SemanticTokenTypes } from "vscode-languageserver";
import { isAttribute, isDto, isDtoProperty, isEntity, isMethodDefinition, isMethodParameter, isPort } from "../generated/ast";

export class PhilyraSemanticTokenProvider extends AbstractSemanticTokenProvider {
  
  protected highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void | "prune" | undefined {
    if (isAttribute(node)) {
      acceptor({ node, feature: 'isId', type: SemanticTokenTypes.modifier });
      acceptor({ node, feature: 'isIndex', type: SemanticTokenTypes.modifier });
      acceptor({ node, feature: 'isArray', type: SemanticTokenTypes.modifier });
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.property });
      acceptor({ node, feature: 'type', type: SemanticTokenTypes.type });
      acceptor({ node, feature: 'otherSide', type: SemanticTokenTypes.property });
    } else if (isPort(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.interface });
    } else if (isMethodDefinition(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.method });
      acceptor({ node, feature: 'type', type: SemanticTokenTypes.type });
      acceptor({ node, feature: 'isArray', type: SemanticTokenTypes.modifier });
    } else if (isMethodParameter(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.parameter });
      acceptor({ node, feature: 'type', type: SemanticTokenTypes.type });
      acceptor({ node, feature: 'isArray', type: SemanticTokenTypes.modifier });
    } else if (isEntity(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.class });
      acceptor({ node, feature: 'inheritance', type: SemanticTokenTypes.modifier });
      acceptor({ node, feature: 'tableName', type: SemanticTokenTypes.namespace });
      acceptor({ node, feature: 'base', type: SemanticTokenTypes.type });
    } else if (isDto(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.class });
      acceptor({ node, feature: 'entity', type: SemanticTokenTypes.type });
    } else if (isDtoProperty(node)) {
      acceptor({ node, feature: 'name', type: SemanticTokenTypes.property });
      acceptor({ node, feature: 'type', type: SemanticTokenTypes.type });
      acceptor({ node, feature: 'isArray', type: SemanticTokenTypes.modifier });
    }
  }

}
