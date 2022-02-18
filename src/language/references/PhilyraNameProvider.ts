import { DefaultNameProvider, AstNode, NamedAstNode } from "langium";
import { isPackage, isModel } from "../generated/ast";

export function isNamed(node: AstNode | any | undefined): node is NamedAstNode {
  if (node == undefined) {
    return false;
  }

  return (node as NamedAstNode).name !== undefined;
}

export class PhilyraNameProvider extends DefaultNameProvider {
  getName(node: AstNode): string | undefined {
    if (isPackage(node) && isPackage(node.$container)) {
      return this.getQualifiedName(node.$container, node.name)
    } else {
      return super.getName(node);
    }
  }

  getQualifiedName(qualifier: AstNode | string | undefined, name: string): string {
    let prefix = qualifier;
    if (isNamed(prefix)) {
      prefix = (!isModel(prefix.$container)
        ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
    }

    return (prefix && !isModel(prefix) ? prefix + '.' : '') + name;
  }
}