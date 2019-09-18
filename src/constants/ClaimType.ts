import ISelectType from './GeneralType';

export enum ClaimType {
  ContentsOnly = 'Contents Only',
  StructureOnly = 'Structure Only',
  ContentsAndStructure = 'Contents and Structure'
}

export const ClaimTypeOptions: ISelectType[] = [
  {value: ClaimType.ContentsOnly, label: ClaimType.ContentsOnly},
  {value: ClaimType.StructureOnly, label: ClaimType.StructureOnly},
  {value: ClaimType.ContentsAndStructure, label: ClaimType.ContentsAndStructure}
];
