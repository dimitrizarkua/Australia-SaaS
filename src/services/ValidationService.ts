import {EditorState} from 'draft-js';
import {stateFromHTML} from 'draft-js-import-html';
import {isArray} from 'lodash';
import {luhn} from 'credit-card';

interface IFormData {
  [field: string]: unknown;
}

interface IRules<TFormData> {
  [field: string]: Array<Rule<TFormData>> | IRules<TFormData>;
}

interface IErrors {
  [field: string]: string | undefined | IErrors;
}

type Rule<TFormData> = (value: unknown, data: TFormData, fieldName: string) => string | undefined;
type Validator<TFormData> = (data: TFormData, errors: IErrors, props?: unknown) => IErrors;

export const createValidator = <TFormData>(rules: IRules<TFormData>, crossFieldValidator?: Validator<TFormData>) => {
  return (data: TFormData, props?: unknown) => {
    const errors: IErrors = applyRules(data, rules);

    if (crossFieldValidator) {
      return crossFieldValidator(data, errors, props);
    }
    return errors;
  };
};

const applyRules = <TFormData>(data: TFormData, rules: IRules<TFormData>) => {
  const errors: IErrors = {};
  Object.keys(rules).forEach(key => {
    if (isArray(rules[key])) {
      const rulesArray = rules[key] as Array<Rule<TFormData>>;
      rulesArray.some(rule => {
        errors[key] = rule(data[key], data, key);
        return !!errors[key];
      });
    } else {
      errors[key] = applyRules<IFormData>(data[key] as IFormData, rules[key] as IRules<IFormData>);
    }
  });
  return errors;
};

export const required = (value?: any) => {
  if (['', null, undefined].includes(value)) {
    return 'This field is required';
  }
  return undefined;
};

export const positiveNumber = (value?: any) => {
  if (isNaN(+value)) {
    return 'Field must contain only numerical value';
  } else if (value < 0) {
    return "Field shouldn't contain negative value";
  }
  return undefined;
};

export const requireId = (value?: any) => {
  if (required(value) || ['', null, undefined].includes(value.id)) {
    return 'This field is required';
  }
  return undefined;
};

export const unsignedInt = (value?: any) => {
  if (value && !/^[0-9]+$/.test(value)) {
    return 'Must be a number';
  }
  return undefined;
};

export const overrideMessage = (validator: (value?: any) => string | undefined, message: string) => (value?: any) => {
  return validator(value) ? message : undefined;
};

export const requiredHtml = (html: string = '') => {
  const text = EditorState.createWithContent(stateFromHTML(html))
    .getCurrentContent()
    .getPlainText();
  return required(text);
};

export const isGreaterThanZero = (value?: any) => {
  if (value && +value < 0) {
    return 'Must be greater than zero';
  }
  return undefined;
};

export const email = (value: any) =>
  !value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? undefined : 'Invalid e-mail address';

export const validCardNumber = (value: string) =>
  value.length > 11 && luhn(value.replace(/\D/g, '')) ? undefined : 'Credit card number is not valid';

export const validCardFullName = (value: string) => {
  const names = value.split(' ');
  return names.length > 1 && names[1].length > 0 ? undefined : 'Name should include first name and last name';
};
