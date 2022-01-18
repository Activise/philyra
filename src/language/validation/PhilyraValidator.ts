import { CstNode, Stream, streamCst, ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { PhilyraAstType, Model, isApplicationConfig, Attribute, ApplicationConfig, isModel, Type, ApplicationConfigProperty } from '../generated/ast';
import { PhilyraServices } from '../PhilyraModule';

type PhilyraChecks = { [type in PhilyraAstType]?: ValidationCheck | ValidationCheck[] }

export class PhilyraValidationRegistry extends ValidationRegistry {

  constructor(services: PhilyraServices) {
    super(services);
    const validator = services.validation.PhilyraValidator;
    const checks: PhilyraChecks = {
      Model: validator.onlyOneApplicationConfig,
      Attribute: validator.dontDuplicateModifiers,
      ApplicationConfig: validator.modelParentForConfig,
      ApplicationConfigProperty: validator.checkForApplicationPropertyValue
    };
    this.register(checks, validator);
  }
}

function findCstNodes(node: CstNode, predicate: (value: CstNode) => boolean): Stream<CstNode> {
  return streamCst(node).distinct(node => node.element).filter(predicate);
}

export class PhilyraValidator {
  onlyOneApplicationConfig(model: Model, accept: ValidationAcceptor): void {
    let configNodeStream = findCstNodes(model.$cstNode!, node => isApplicationConfig(node.element));
    let configNodeArray = configNodeStream.toArray();

    if (configNodeArray.length > 1) {
      configNodeArray.forEach(config => accept('error', "Multiple application configs aren't allowed!", { node: config.element }))
    }
  }

  dontDuplicateModifiers(attribute: Attribute, accept: ValidationAcceptor): void {
  }

  modelParentForConfig(config: ApplicationConfig, accept: ValidationAcceptor): void {
    if (!isModel(config.$container)) {
      accept('error', "The config must be in the document root.", { node: config });
    }
  }

  checkForDuplicateTypeNames(type: Type, accept: ValidationAcceptor): void {
  }

  checkForApplicationPropertyValue(property: ApplicationConfigProperty, accept: ValidationAcceptor): void {
    if (property.value == undefined && property.subProperties.length == 0) {
      accept("warning", "The config property has no value.", { node: property });
    }
  }
}
