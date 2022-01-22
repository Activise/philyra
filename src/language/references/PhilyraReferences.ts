import { AstNode, IndexManager, LangiumServices, Reference, Stream } from "langium";
import { PhilyraLinker } from "./PhilyraLinker";

export class PhilyraReferences {
  protected readonly indexManager: IndexManager;
  protected readonly linker: PhilyraLinker;

  constructor(services: LangiumServices) {
    this.indexManager = services.shared.workspace.IndexManager;
    this.linker = services.references.Linker as PhilyraLinker;
  }

  public findReferenced(nodeType: string, reference: Reference<AstNode>): Stream<AstNode | undefined> {
    return this.indexManager.allElements(nodeType).filter(description => description.name == reference.$refText).map(this.linker.loadAstNode.bind(this.linker));
  }
}