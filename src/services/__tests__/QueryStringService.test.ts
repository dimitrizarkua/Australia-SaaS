import {stringify} from '../QueryStringService';

describe('QueryStringService', () => {
  describe('stringify', () => {
    it('should return blank string, if params are empty', () => {
      const params = {};
      expect(stringify(params)).toEqual('');
    });

    it('should remove empty strings from parameters', () => {
      const params = {search: '', test: 1};
      expect(stringify(params)).toEqual('?test=1');
    });

    it('should remove undefined from parameters', () => {
      const params = {search: undefined, test: 1};
      expect(stringify(params)).toEqual('?test=1');
    });

    it('should remove null from parameters', () => {
      const params = {search: null, test: 1};
      expect(stringify(params)).toEqual('?test=1');
    });

    it('should keep 0 in the url', () => {
      const params = {test: 0};
      expect(stringify(params)).toEqual('?test=0');
    });
  });
});
