import {IUser} from 'src/models/IUser';
import {ITask} from 'src/models/ITask';

export interface IRun {
  id: number;
  location_id: number;
  date: string;
  name: string;
  assigned_users: IUser[];
  assigned_vehicles: any[]; // TODO add IVehicle[]
  assigned_tasks: ITask[];
}
