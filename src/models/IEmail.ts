import {IJob} from './IJob';

export interface IEmail {
  job: IJob | null;
  header: string;
  text: string;
  date: string;
  from: string;
  to: string;
  pinned_at: boolean;
  id: number;
}
