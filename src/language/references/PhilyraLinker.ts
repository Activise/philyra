import { AstNode, AstNodeDescription, DefaultLinker, LangiumServices } from "langium";

export class PhilyraLinker extends DefaultLinker {
  constructor(services: LangiumServices) {
    super(services);
  }

  // Made it public
  public loadAstNode(nodeDescription: AstNodeDescription): AstNode | undefined {
      return super.loadAstNode(nodeDescription);
  }
}