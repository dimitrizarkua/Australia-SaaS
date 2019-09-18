import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalLabour';
import {ILabour, IAddLabourRequest, IEditLabourRequest} from 'src/models/UsageAndActualsModels/ILabour';
import {BACKEND_DATE_TIME} from 'src/constants/Date';
import moment, {Moment} from 'moment';
import {convertIntToTime, contvertTimeToMinutes} from 'src/utility/Helpers';

function composeDates(date: Moment, startDate: Moment, endDate?: Moment) {
  let datePart = moment(date);
  const timeStart = moment(startDate);
  const timeEnd = moment(endDate);
  const started = datePart.add(timeStart.hour(), 'hour').add(timeStart.minute(), 'minute');
  datePart = moment(date);
  const ended = datePart.add(timeEnd.hour(), 'hour').add(timeEnd.minute(), 'minute');

  return {started, ended};
}

const dehydrateToAdd = (data: IFormValues): IAddLabourRequest => {
  const datesOverride = composeDates(data.started_at_date, data.started_at_override, data.ended_at_override);

  return {
    job_id: data.job_id,
    labour_type_id: data.labour_type.id,
    worker_id: data.user.id,
    creator_id: data.creator_id,
    started_at: datesOverride.started.format(BACKEND_DATE_TIME),
    ended_at: datesOverride.ended.format(BACKEND_DATE_TIME),
    break: data.break && contvertTimeToMinutes(data.break)
  } as IAddLabourRequest;
};

const dehydrateToEdit = (data: IFormValues): IEditLabourRequest => {
  const datesOverride = composeDates(data.started_at_date, data.started_at_override, data.ended_at_override);

  return {
    started_at_override: datesOverride.started.format(BACKEND_DATE_TIME),
    ended_at_override: datesOverride.ended && datesOverride.ended.format(BACKEND_DATE_TIME),
    break: data.break ? contvertTimeToMinutes(data.break) : 0
  } as IEditLabourRequest;
};

const hydrate = (data: ILabour): IFormValues => {
  return {
    ...data,
    started_at_date: moment(data.started_at_override),
    started_at_override: moment(data.started_at_override).utcOffset(0),
    ended_at_override: data.ended_at_override && moment(data.ended_at_override).utcOffset(0),
    user: data.worker,
    break: data.break && convertIntToTime(data.break)
  } as IFormValues;
};

export default {dehydrateToAdd, dehydrateToEdit, hydrate};
