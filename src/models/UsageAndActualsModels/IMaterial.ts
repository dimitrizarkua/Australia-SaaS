export interface IMaterial {
  id: number;
  name: string;
  measure_unit_id: number;
  default_sell_cost_per_unit: number;
  default_buy_cost_per_unit: number;
  created_at: string;
  updated_at: string;
  measure_unit: IMeasureUnit;
}

export interface IMeasureUnit {
  id: number;
  name: string;
  code: string;
}

export interface IMaterialInfo {
  id: number;
  job_id: number;
  material_id: number;
  creator_id: number;
  used_at: string;
  sell_cost_per_unit: number;
  buy_cost_per_unit: number;
  quantity_used: number;
  quantity_used_override: number;
  invoice_item_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  material: IMaterial;
  amount: number;
  amount_override: number;
}

export interface IAddMaterialToJobConfig {
  job_id: number;
  material_id: number;
  creator_id: number;
  used_at: string;
  quantity_used: number;
  quantity_used_override?: number;
}
