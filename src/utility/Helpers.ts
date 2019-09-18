import {IUser} from 'src/models/IUser';
import {isNil, pad, padStart} from 'lodash';
import moment, {Moment} from 'moment';
import {colorStatus, FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';
import * as DOMPurify from 'dompurify';

export interface IUserNames {
  first_name: string;
  last_name: string;
  initials: string;
  full_name: string;
  name: string;
  invalid: boolean;
}

export function getUserNames(user: IUser = {} as IUser): IUserNames {
  if (user === null) {
    user = {} as IUser;
  }

  const res: IUserNames = {
    first_name: user.first_name || '---',
    last_name: user.last_name || '---',
    initials: '',
    full_name: '',
    name: '',
    invalid: false
  };

  if (user.first_name && user.last_name) {
    res.initials = `${user.first_name[0]}${user.last_name[0]}`;
  } else {
    res.initials = '--';
  }

  if (user.full_name) {
    res.full_name = user.full_name;
  } else {
    res.full_name = `${res.first_name} ${res.last_name}`;
  }

  res.invalid = res.full_name.includes('---');
  res.name = (res.invalid ? user.email : res.full_name) || res.full_name;

  return res;
}

export interface ISortedItem<T> {
  unix: number;
  items: T[];
}

export function sortedByDateGroups<T>(data: any[] | null, sortKey: string): Array<ISortedItem<T>> {
  if (data) {
    const dates = {};

    data.forEach((el: any) => {
      const date = moment(el[sortKey]);
      const dateStr = `${date.year()}-${date.month() + 1}-${date.date()}`;

      if (!dates[moment(dateStr).unix()]) {
        dates[moment(dateStr).unix()] = {
          unix: moment(dateStr).unix(),
          items: [el]
        };
      } else {
        dates[moment(dateStr).unix()].items.push(el);
        dates[moment(dateStr).unix()].items = dates[moment(dateStr).unix()].items.sort((a: T, b: T) =>
          moment(a[sortKey]) > moment(b[sortKey]) ? -1 : 1
        );
      }
    });

    return Object.values(dates).sort((a: any, b: any) => (a.unix > b.unix ? -1 : 1)) as Array<ISortedItem<T>>;
  } else {
    return [];
  }
}

export function formatPrice(price: number | string, addFractionPart: boolean = true) {
  if (isNil(price)) {
    return '$ 0.00';
  }
  const unsigned = Math.abs(typeof price === 'string' ? parseFloat(price) : price);
  const formatted = addFractionPart
    ? addCommasToPrice(unsigned.toFixed(2).toString())
    : addCommasToPrice(unsigned.toFixed(0).toString());
  return `${price < 0 ? '-' : ''}$ ${formatted}`;
}

export function addCommasToPrice(price: string) {
  return price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function sanitize(html: string, noTags?: boolean) {
  return DOMPurify.sanitize(html.replace(/\n/g, '<br />'), {
    ALLOWED_TAGS: noTags ? [] : ['b', 'strong', 'i', 'em', 'u', 'ul', 'li', 'p', 'span', 'br']
  });
}

export function replaceMentions(html: string) {
  return html.replace(
    /@(\w+)_(\w+)\b/g,
    (str, firstName, secondName) => `<strong>@${firstName} ${secondName}</strong>`
  );
}

export function colorTransformer(inputValue: number): string {
  return `#${`00000${inputValue.toString(16)}`.slice(-6)}`;
}

export interface IStatusesEntity {
  latest_status?: {
    status: string;
  };
  virtual_status?: string;
}

export function getFinanceItemStatusList(
  {latest_status, virtual_status}: IStatusesEntity,
  omitStatusesList: FinanceEntityStatus[] = []
): string[] {
  const statusList: string[] = [];

  if (latest_status && latest_status.status) {
    statusList.push(latest_status.status);
  }

  if (virtual_status && virtual_status !== statusList[0]) {
    statusList.push(virtual_status);
  }

  return statusList.filter(status => !omitStatusesList.includes(status as FinanceEntityStatus));
}

export function getFinanceItemStatusesColor(status: FinanceEntityStatus) {
  return colorStatus[status] || colorStatus.DEFAULT;
}

export function getFormatPriceOrEmpty(value: number | string, emptyChar: string = '') {
  return value ? formatPrice(value) : emptyChar;
}

export function convertIntToTimeString(minutes: number | string) {
  const hours = Math.floor(+minutes / 60);
  minutes = +minutes % 60;
  return `${pad(hours.toString())}:${padStart(minutes.toString(), 2, '0')}`;
}

export function convertIntToTime(minutes: number | string) {
  const hours = Math.floor(+minutes / 60);
  minutes = +minutes % 60;
  return moment()
    .hour(hours)
    .minutes(minutes);
}

export function contvertTimeToMinutes(value: Moment | string): number {
  return moment(value).hours() * 60 + moment(value).minutes();
}
