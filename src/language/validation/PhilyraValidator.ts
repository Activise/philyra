import { AstNodeDescription, CstNode, getDocument, Stream, streamCst, ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { PhilyraAstType, Model, isApplicationConfig, ApplicationConfig, isModel, Type, ApplicationConfigProperty, CombinedIndex, isPackage, Attribute, isEntity, isDto } from '../generated/ast';
import { PhilyraServices } from '../PhilyraModule';
import { isNamed, PhilyraNameProvider } from '../references/PhilyraNameProvider';

type PhilyraChecks = { [type in PhilyraAstType]?: ValidationCheck | ValidationCheck[] }

export class PhilyraValidationRegistry extends ValidationRegistry {

  constructor(services: PhilyraServices) {
    super(services);
    const validator = services.validation.PhilyraValidator;
    const checks: PhilyraChecks = {
      Model: validator.onlyOneApplicationConfig,
      ApplicationConfig: validator.modelParentForConfig,
      ApplicationConfigProperty: validator.checkForApplicationPropertyValue,
      Type: validator.checkForDuplicateTypeNames,
      CombinedIndex: validator.multipleIndicesRequired,
      Attribute: validator.validateAttribute
    };
    this.register(checks, validator);
  }
}

function findCstNodes(node: CstNode, predicate: (value: CstNode) => boolean): Stream<CstNode> {
  return streamCst(node).distinct(node => node.element).filter(predicate);
}

export class PhilyraValidator {
  readonly nameProvider: PhilyraNameProvider;

  constructor(services: PhilyraServices) {
    this.nameProvider = services.references.NameProvider as PhilyraNameProvider;
  }

  onlyOneApplicationConfig(model: Model, accept: ValidationAcceptor): void {
    let configNodeStream = findCstNodes(model.$cstNode!, node => isApplicationConfig(node.element));
    let configNodeArray = configNodeStream.toArray();

    if (configNodeArray.length > 1) {
      configNodeArray.forEach(config => accept('error', "Multiple application configs aren't allowed!", { node: config.element }))
    }
  }

  multipleIndicesRequired(combinedIndex: CombinedIndex, accept: ValidationAcceptor): void {
    if (combinedIndex.attributes.length < 2) {
      accept('error', 'A combined index needs more than 1 index.', { node: combinedIndex })
    }
  }

  modelParentForConfig(config: ApplicationConfig, accept: ValidationAcceptor): void {
    if (!isModel(config.$container)) {
      accept('error', 'The config must be in the document root.', { node: config });
    }
  }

  checkForDuplicateTypeNames(type: Type, accept: ValidationAcceptor): void {
    let precomputedScopes = getDocument(type).precomputedScopes;
    let descriptions: AstNodeDescription[] = [];

    let container = type.$container;
    descriptions.push(...precomputedScopes?.get(container) || []);
    if (isPackage(container)) {
      descriptions.push(...precomputedScopes?.get(container.$container) || []);
    }

    descriptions.forEach(description => {
      let node = description.node;

      if (isNamed(node) && node != type && node.name == type.name) {
        if (node.$container == type.$container) {
          accept('error', `A type named '${type.name}' is already declared in the package.`, { node: type });
        } else {
          accept('error', `A type named '${type.name}' is imported as '${this.nameProvider.getQualifiedName(node.$container, node.name)}'.`, { node: type });
        }
      }
    });
  }

  checkForApplicationPropertyValue(property: ApplicationConfigProperty, accept: ValidationAcceptor): void {
    if (property.value == undefined && property.subProperties.length == 0) {
      accept('warning', 'The config property has no value.', { node: property });
    }
  }

  validateAttribute(attribute: Attribute, accept: ValidationAcceptor): void {
    let type = attribute.typeInfo.type.ref;
    let isEntityOrDto = isEntity(type) || isDto(type);
    if (attribute.isIndex && isEntityOrDto) {
      accept('error', "Can't index DTOs or Entities.", { node: attribute });
    }

    if (attribute.isId && isEntityOrDto) {
      accept('error', "Can't have DTOs or Entities as id.", { node: attribute });
    }

    if (attribute.isId && attribute.typeInfo.isArray) {
      accept('error', "The id can't be an array", { node: attribute });
    }
  }
}
