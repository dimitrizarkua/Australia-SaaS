import {IUser} from 'src/models/IUser';
import {IStatus} from 'src/models/IStatus';
import {ITeamSimple} from 'src/models/ITeam';
import {IJob} from 'src/models/IJob';

export enum TaskStatuses {
  Active = 'Active',
  Completed = 'Completed'
}

export interface ITask {
  id: number;
  job_id: number;
  job_run_id: number;
  job_task_type_id: number;
  starts_at: string;
  ends_at: string;
  assigned_users: IUser[];
  assigned_teams: ITeamSimple[];
  type: ITaskType;
  name: string;
  internal_note: string;
  scheduling_note: string;
  kpi_missed_reason: string;
  due_at: string;
  latest_status: IStatus<TaskStatuses>;
  latest_scheduled_status: IStatus<TaskStatuses>;
  job: IJob;
  created_at: string;
  snoozed_until: string;
}

export interface ITaskType {
  id: number;
  name: string;
  can_be_scheduled: boolean;
  default_duration_minutes: number;
  kpi_hours: number | null;
  kpi_include_afterhours: boolean;
  deleted_at: string | null;
  color: number;
  allow_edit_due_date: boolean;
}
