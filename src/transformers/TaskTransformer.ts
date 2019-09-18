import {IFormValues} from '../components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import DateTransformer from './DateTransformer';
import {Moment} from 'moment';
import {ITask, ITaskType} from 'src/models/ITask';

const dehydrate = (data: IFormValues | (ITask & IFormValues)) => ({
  ...data,
  id: data.id,
  job_task_type_id: +(data.type as ITaskType).id,
  name: (data.type as ITaskType).name,
  internal_note: data.internal_note,
  scheduling_note: data.scheduling_note || '',
  kpi_missed_reason: data.kpi_missed_reason || '',
  due_at: DateTransformer.dehydrateDateTime(data.due_at as Moment),
  starts_at: (data.starts_at && DateTransformer.dehydrateDateTime(data.starts_at as Moment)) || '',
  ends_at: (data.ends_at && DateTransformer.dehydrateDateTime(data.ends_at as Moment)) || ''
});

const hydrate = (data: any) => {
  const clone = Object.assign({}, data);
  clone.due_at = DateTransformer.hydrateDateTime(data.due_at);
  clone.starts_at = DateTransformer.hydrateDateTime(data.starts_at);
  clone.ends_at = DateTransformer.hydrateDateTime(data.ends_at);
  return Object.assign({kpi_time: `${clone.type.kpi_hours || 0} hours`}, clone);
};

export default {
  dehydrate,
  hydrate
};
