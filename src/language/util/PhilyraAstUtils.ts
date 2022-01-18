import { Dto, isModel, isPackage, Model, Package, Type } from "../generated/ast";

export type MemberToExport = Package | Type | Dto;
export function getMembersToExport(container: Model | Package): MemberToExport[] {
  if (isModel(container)) {
    return container.packages.flatMap(p => getMembersToExport(p));
  } else if (isPackage(container)) {
    return [...container.entities, ...container.dtos, ...container.types];
  }

  return [];
}
