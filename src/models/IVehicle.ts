export interface IVehicle {
  location_id: number;
  type: string;
  make: string;
  model: string;
  registration: string;
  rent_starts_at: string;
  rent_ends_at: string;
  updated_at: string;
  created_at: string;
  id: number;
  latest_status: IVehicleStatus;
  is_booked?: boolean;
}

export interface IVehicleStatus {
  id: number;
  vehicle_id: number;
  vehicle_status_type_id: number;
  user_id: number;
  created_at: string;
  type: IVehicleStatusType;
}

export interface IVehicleStatusType {
  id: number;
  name: string;
  makes_vehicle_unavailable: boolean;
  is_default: boolean;
  deleted_at: string;
}
