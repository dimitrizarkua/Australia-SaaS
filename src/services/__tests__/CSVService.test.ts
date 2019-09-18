import CSVService from 'src/services/CSVService';

const valueArray = [
  {
    field1: 'Test1',
    field2: 2,
    field3: 3.5
  },
  {
    field1: 'Test4',
    field2: 5,
    field3: 6.5
  },
  {
    field1: 'Test7',
    field2: 8,
    field3: -9.5
  }
];

describe('CSVService', () => {
  describe('exportToCsv', () => {
    it('should return blank string, if params are empty', () => {
      expect(CSVService.exportToCsv([])).toEqual('');
    });

    it('should return correct CSV from array of objects', () => {
      const ret = `field1,field2,field3\r\n"Test1",2,3.5\r\n"Test4",5,6.5\r\n"Test7",8,-9.5`;
      expect(CSVService.exportToCsv(valueArray)).toEqual(ret);
    });
  });
});
