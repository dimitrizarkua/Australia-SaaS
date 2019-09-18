import ISelectType from './GeneralType';

export enum Criticality {
  Critical = 'Critical',
  NonCritical = 'Non-Critical',
  SemiCritical = 'Semi-Critical'
}

export const CriticalityOptions: ISelectType[] = [
  {value: Criticality.Critical, label: Criticality.Critical},
  {value: Criticality.NonCritical, label: Criticality.NonCritical},
  {value: Criticality.SemiCritical, label: Criticality.SemiCritical}
];
