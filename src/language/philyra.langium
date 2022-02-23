grammar Philyra

entry Model: (applicationConfig=ApplicationConfig | imports+=Import | packages+=Package)*;

ApplicationConfig:
    'applicationConfig' '{'
        properties+=ApplicationConfigProperty*
    '}';
ApplicationConfigProperty:
    key=ID ':' value=(STRING | NUMBER)? ('{'
        subProperties+=ApplicationConfigProperty*
    '}')?;


Import:
    'import' toImport=[TypeToImport:QualifiedName];
TypeToImport: Entity | ExternalType | Dto | Package;
Package:
    'package' name=QualifiedName '{'
        (repository=Repository | crud=Crud | imports+=Import | types+=ExternalType | entities+=Entity | dtos+=Dto | ports+=Port)*
    '}';


Type: Entity | ExternalType | Dto;
fragment TypeDefinition: (('[' type=[Type:QualifiedName] isArray?=']') | (type=[Type:QualifiedName] isArray?='[]'?));


Port:
    isSplitted?='splitted'? 'port' type=PortType name=ID '{'
        methods+=MethodDefinition*
    '}';
PortType returns string: 'in' | 'out';
MethodDefinition: NameWithKeyword '(' (parameters+=MethodParameter* (',' parameters+=MethodParameter)*) ')' ':' TypeDefinition;
MethodParameter: NameWithKeyword ':' TypeDefinition;


Entity:
    'entity' NameWithKeyword ('(' tableName=ID ')')? ('is' base=[Entity:QualifiedName])? ('->' inheritance=InheritanceMode)? '{'
        (combinedIndices+=CombinedIndex | attributes+=Attribute)*
    '}';
InheritanceMode returns string: 'single' | 'multi';
CombinedIndex: 'combined' 'index' attributes+=[Attribute:KeywordOrId] (',' attributes+=[Attribute:KeywordOrId])*;
Attribute: Modifiers NameWithKeyword ':' (('[' type=[Type:QualifiedName] isArray?=']') | (type=[Type:QualifiedName] isArray?='[]'?)) ('from' otherSide=[Attribute:KeywordOrId])?;
fragment Modifiers: (isId?='id' | isIndex?='index')*;


Repository:
    'repository' 'for' (forAll?='all' | entities+=[Entity] (',' entities+=[Entity])*);
Crud:
    'crud' 'for' (forAll?='all' | entities+=[Entity] (',' entities+=[Entity])*);


Dto:
    'dto' NameWithKeyword ('wraps' entity=[Entity:QualifiedName])? '{'
        properties+=DtoProperty*
    '}';
DtoProperty:
    NameWithKeyword ':' TypeDefinition;


ExternalType:
    'type' NameWithKeyword '{'
        mappings+=ExternalTypeMapping*
    '}';
ExternalTypeMapping:
    language=STRING 'to' mapping=STRING;

KeywordOrId returns string: Keyword | ID;
QualifiedName returns string: ID ('.' ID)*;
Keyword returns string: 'id' | 'index';
fragment NameWithKeyword: (name=ID | '[' name=Keyword ']');

terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[+-]?([0-9]*[.])?[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
