interface ITeam {
  id: number;
  name: string;
  jobs_count: number;
}

export interface IJobsInfo {
  inbox: number;
  mine: number;
  active: number;
  closed: number;
  teams: ITeam[];
  no_contact_24_hours: number;
  upcoming_kpi: number;
}
