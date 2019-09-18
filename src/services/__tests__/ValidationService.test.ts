import {overrideMessage, required, requiredHtml, unsignedInt} from '../ValidationService';

describe('validation', () => {
  describe('required', () => {
    it('should return error if value is missing', () => {
      const error = 'This field is required';
      expect(required()).toEqual(error);
      expect(required('')).toEqual(error);
      expect(required(undefined)).toEqual(error);
      expect(required(null)).toEqual(error);
    });

    it('should return undefined if value is passed', () => {
      expect(required('123')).toBeUndefined();
      expect(required(123)).toBeUndefined();
      expect(required(0)).toBeUndefined();
    });
  });

  describe('requiredHtml', () => {
    it('should return error if value is missing', () => {
      const error = 'This field is required';
      expect(requiredHtml()).toEqual(error);
      expect(requiredHtml('')).toEqual(error);
      expect(requiredHtml(undefined)).toEqual(error);
      expect(requiredHtml('<p><br /></p>')).toEqual(error);
    });

    it('should return undefined if value is passed', () => {
      expect(requiredHtml('123')).toBeUndefined();
    });
  });

  describe('unsignedInt', () => {
    it('should return undefined if no value passed', () => {
      const error = 'Must be a number';
      expect(unsignedInt('-1')).toEqual(error);
      expect(unsignedInt(-1)).toEqual(error);
      expect(unsignedInt('a')).toEqual(error);
      expect(unsignedInt('a1')).toEqual(error);
      expect(unsignedInt([])).toEqual(error);
      expect(unsignedInt({})).toEqual(error);
    });

    it('should return undefined if no value passed', () => {
      expect(unsignedInt()).toBeUndefined();
      expect(unsignedInt('')).toBeUndefined();
      expect(unsignedInt(undefined)).toBeUndefined();
      expect(unsignedInt(null)).toBeUndefined();
    });

    it('should return undefined if integer is passed', () => {
      expect(unsignedInt(0)).toBeUndefined();
      expect(unsignedInt('0')).toBeUndefined();
      expect(unsignedInt(123)).toBeUndefined();
      expect(unsignedInt('123')).toBeUndefined();
    });
  });

  describe('message', () => {
    it('should override error message', () => {
      const msg = 'VERY REQUIRED FIELD';
      expect(overrideMessage(required, msg)('')).toEqual(msg);
    });
  });
});
