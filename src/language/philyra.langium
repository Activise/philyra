grammar Philyra

entry Model: (applicationConfig=ApplicationConfig | imports+=Import | packages+=Package)*;

Package:
    'package' name=QualifiedName '{'
        (imports+=Import | types+=ExternalType | entities+=Entity | dtos+=Dto)*
    '}';

Import:
    'import' toImport=[TypeToImport:QualifiedName];

TypeToImport: Entity | ExternalType | Package;

ApplicationConfig:
    'applicationConfig' '{'
        properties+=ApplicationConfigProperty*
    '}';

ApplicationConfigProperty:
    key=ID ':' value=(STRING | NUMBER)? ('{'
        subProperties+=ApplicationConfigProperty*
    '}')?;

Entity:
    'entity' name=IDWithKeword ('(' tableName=ID ')')? ('is' base=[Entity:QualifiedName])? '{'
        attributes+=Attribute*
    '}';

Attribute:
    Modifiers name=IDWithKeword ':' (('[' type=[Type:QualifiedName] isArray?=']') | type=[Type:QualifiedName] isArray?='[]'?) ('from' otherSide=[Attribute])?;

/*
 * [1..n] = OneToMany
 * [m..n] = ManyToMany
 * [1..1] = OneToOne
 */
RelationType returns string: '[1..n]' | '[m..n]' | '1..1';

Dto:
    'dto' name=ID ('wraps' entity=[Entity:QualifiedName])? '{'
        properties+=DtoProperty*
    '}';

DtoProperty:
    name=IDWithKeword ':' type=[Type:QualifiedName];

ExternalType:
    'type' name=IDWithKeword '{'
        mappings+=ExternalTypeMapping*
    '}';
ExternalTypeMapping:
    language=STRING 'to' mapping=STRING;

Type: Entity | ExternalType;

QualifiedName returns string: ID ('.' ID)*;
IDWithKeword returns string: ID | '[' Keyword ']';
Keyword returns string: 'id' | 'index';

fragment Modifiers: (isId?='id' | isIndex?='index')*;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[+-]?([0-9]*[.])?[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
