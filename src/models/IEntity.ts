import {Moment} from 'moment';

export interface IEntity {
  id: number;
}

export interface INamedEntity extends IEntity {
  name: string;
}

export interface ICreatedEntity {
  created_at: Moment;
}

export interface IEditedEntity extends ICreatedEntity {
  updated_at: Moment;
}

export interface ITrackedEntity extends IEditedEntity {
  deleted_at: Moment | null;
}
