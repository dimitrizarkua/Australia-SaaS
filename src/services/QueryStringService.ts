import * as qs from 'qs';
import {pickBy} from 'lodash';

const ignoredValues = ['', null, undefined];

export const stringify = (params: any) => {
  const nonEmptyParams = pickBy(params, v => !ignoredValues.includes(v));
  return qs.stringify(nonEmptyParams, {addQueryPrefix: true});
};
