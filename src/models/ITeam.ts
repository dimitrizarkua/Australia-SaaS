import {ILocation} from './IAddress';

export enum UTEntityTypes {
  user = 'user',
  team = 'team'
}

export type EntityTypes = UTEntityTypes.user | UTEntityTypes.team;

export interface ITeamSimple {
  id: number;
  name: string;
}

export interface IUserTeamSimple {
  id: number;
  name: string;
  type: EntityTypes;
  primary_location?: ILocation;
}

export interface IUsersTeams {
  users: IUserTeamSimple[];
  teams: IUserTeamSimple[];
}
