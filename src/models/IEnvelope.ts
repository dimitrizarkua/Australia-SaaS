export interface IObjectEnvelope<T> {
  data: T;
}

export interface IListEnvelope<T> {
  data: T[];
  pagination: IPagination;
}

export interface IPagination {
  per_page: number;
  current_page: number;
  last_page: number;
}
