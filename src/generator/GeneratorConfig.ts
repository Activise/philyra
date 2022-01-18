import * as Ast from "../language/generated/ast";

export interface ApplicationConfig {
  name?: string;
  language?: LanguageConfig | string;
}

export interface LanguageConfig {
  name?: string;
  framework?: FrameworkConfig | string;
}

export interface FrameworkConfig {
  name?: string;
  database?: DatabaseConfig | string;
}

export interface DatabaseConfig {
  name?: string;
}

export function createGeneratorConfig(astConfig: Ast.ApplicationConfig): ApplicationConfig {
  let properties = astConfig.properties;
  let created: any = {};
  for (let property of properties) {
    created[property.key] = createProperties(property);
  }
  return created;
}

function createProperties(property: Ast.ApplicationConfigProperty): any {
  if (property.subProperties.length == 0) {
    return property.value;
  } else {
    let object: any = {};
    object["name"] = property.value;
    for (let innerProp of property.subProperties) {
      object[innerProp.key] = createProperties(innerProp);
    }
    return object;
  }
}
