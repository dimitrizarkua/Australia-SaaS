import moment from 'moment';
import {Moment} from 'moment';
import {BACKEND_DATE, BACKEND_DATE_TIME} from 'src/constants/Date';

const hydrate = (date: string | null | undefined, format: string): Moment | null => {
  if (!date) {
    return null;
  }
  return moment(date, format);
};

const dehydrate = (date: Moment | null | undefined, format: string): string | null => {
  if (!date) {
    return null;
  }
  return moment(date).format(format);
};

const hydrateDate = (date?: string | null) => hydrate(date, BACKEND_DATE);

const hydrateDateTime = (date?: string | null) => hydrate(date, BACKEND_DATE_TIME);

const dehydrateDate = (date?: Moment | null, dateFormat?: string) => dehydrate(date, dateFormat || BACKEND_DATE);

const dehydrateDateTime = (date?: Moment | null) => dehydrate(date, BACKEND_DATE_TIME);

export default {
  hydrateDate,
  hydrateDateTime,
  dehydrateDate,
  dehydrateDateTime
};
