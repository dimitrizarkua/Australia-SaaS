import {addCommasToPrice} from './Helpers';

export function normalizeCardNumber(value: string) {
  const MAX_CC_NUMBER_LENGTH_WITH_SPACES = 23;
  return value
    .substr(0, MAX_CC_NUMBER_LENGTH_WITH_SPACES)
    .replace(/[^\d\s]|\s(?=\s)/g, '')
    .replace(/(^\d{4}|\s+\d{4})(\d)/g, '$1 $2');
}

export function normalizeName(value: string) {
  return capitalize(value)
    .replace(/[^a-zA-Z\s\.'-]/g, '')
    .replace(/\s+/g, ' ');
}

export function capitalize(value: string) {
  return value.toUpperCase();
}

export function normalizePrice(value: string) {
  const formatted = addCommasToPrice(value.replace(/[^\d\.]/g, '').replace(/(\.\d\d)(\d)/g, '$1'));
  return formatted ? `$ ${formatted}` : '';
}

export function normalizePositeveInt(value: string) {
  return value.replace(/\D/g, '');
}

export function normalizeReal(value: string) {
  return value.replace(/[^\d\.]/g, '').replace(/(\.)(\d*)(\.)$/g, '$1$2');
}

export function normalizePercents(value: string) {
  const realVal = normalizeReal(value);
  return parseFloat(realVal) > 100 ? '100' : realVal;
}
