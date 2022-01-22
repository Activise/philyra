import { createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject, LangiumServices, LangiumSharedServices, Module, PartialLangiumServices } from 'langium';
import { PhilyraGeneratedModule, PhilyraGeneratedSharedModule } from './generated/module';
import { PhilyraAstNodeDescriptionProvider } from './index/PhilyraAstNodeDescriptionProvider';
import { PhilyraLinker } from './references/PhilyraLinker';
import { PhilyraNameProvider } from './references/PhilyraNameProvider';
import { PhilyraReferences } from './references/PhilyraReferences';
import { PhilyraScopeComputation } from './references/PhilyraScopeComputation';
import { PhilyraScopeProvider } from './references/PhilyraScopeProvider';
import { PhilyraValidator, PhilyraValidationRegistry } from './validation/PhilyraValidator';

export type PhilyraAddedServices = {
  validation: {
    PhilyraValidator: PhilyraValidator
  },
  references: {
    CustomReferences: PhilyraReferences
  }
};

export type PhilyraServices = LangiumServices & PhilyraAddedServices

export const PhilyraModule: Module<PhilyraServices, PartialLangiumServices & PhilyraAddedServices> = {
  validation: {
    ValidationRegistry: (injector) => new PhilyraValidationRegistry(injector),
    PhilyraValidator: () => new PhilyraValidator()
  },
  index: {
    AstNodeDescriptionProvider: (injector) => new PhilyraAstNodeDescriptionProvider(injector)
  },
  references: {
    NameProvider: () => new PhilyraNameProvider(),
    ScopeComputation: (injector) => new PhilyraScopeComputation(injector),
    ScopeProvider: (injector) => new PhilyraScopeProvider(injector),
    Linker: (injector) => new PhilyraLinker(injector),
    CustomReferences: (injector) => new PhilyraReferences(injector)
  }
};

export function createPhilyraServices(context?: DefaultSharedModuleContext): {
  shared: LangiumSharedServices,
  philyra: PhilyraServices
} {
  const shared = inject(
    createDefaultSharedModule(context),
    PhilyraGeneratedSharedModule
  );
  const philyra = inject(
    createDefaultModule({ shared }),
    PhilyraGeneratedModule,
    PhilyraModule
  );
  shared.ServiceRegistry.register(philyra);
  return { shared, philyra };
}
