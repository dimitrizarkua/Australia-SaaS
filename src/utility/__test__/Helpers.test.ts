import {getUserNames, formatPrice, sortedByDateGroups, getFinanceItemStatusList} from '../Helpers';
import {IUser} from 'src/models/IUser';
import faker from 'faker';
import {IStatusesEntity} from 'src/utility/Helpers';

describe('getUserNames', () => {
  const fakeUser: Partial<IUser> = {
    first_name: 'LeBron',
    last_name: 'James'
  };

  it('Return default values when user is undefined', () => {
    expect(getUserNames(undefined).full_name).toEqual('--- ---');
    expect(getUserNames(undefined).first_name).toEqual('---');
    expect(getUserNames(undefined).last_name).toEqual('---');
    expect(getUserNames(undefined).initials).toEqual('--');
  });

  it(`Return "${fakeUser.first_name} ${fakeUser.last_name}" as user's full_name`, () => {
    expect(getUserNames(fakeUser as IUser).full_name).toEqual(`${fakeUser.first_name} ${fakeUser.last_name}`);
  });

  it(`Return "--- ${fakeUser.last_name}" as user's full_name when no first_name`, () => {
    const fakeUserClone = Object.assign({}, fakeUser);
    delete fakeUserClone.first_name;
    expect(getUserNames(fakeUserClone as IUser).full_name).toEqual(`--- ${fakeUser.last_name}`);
  });

  it(`Return "${fakeUser.first_name} ---" as user's full_name when no first_name`, () => {
    const fakeUserClone = Object.assign({}, fakeUser);
    delete fakeUserClone.last_name;
    expect(getUserNames(fakeUserClone as IUser).full_name).toEqual(`${fakeUser.first_name} ---`);
  });

  it(`Return "${fakeUser.first_name![0]}${fakeUser.last_name![0]}" as user's initials`, () => {
    expect(getUserNames(fakeUser as IUser).initials).toEqual(`${fakeUser.first_name![0]}${fakeUser.last_name![0]}`);
  });

  it(`Return "--" as user's initials when no first_name`, () => {
    const fakeUserClone = Object.assign({}, fakeUser);
    delete fakeUserClone.first_name;
    expect(getUserNames(fakeUserClone as IUser).initials).toEqual('--');
  });

  it(`Return email as user's name when missing full_name`, () => {
    const user = {email: 'email@test.test'} as IUser;
    expect(getUserNames(user).name).toEqual(user.email);
    expect(getUserNames({...user, first_name: 'John'}).name).toEqual(user.email);
    expect(getUserNames({...user, last_name: 'Smith'}).name).toEqual(user.email);
  });

  it(`Return full name as user's name when has full_name`, () => {
    const user = {email: 'email@test.test'} as IUser;
    expect(getUserNames({...user, first_name: 'John', last_name: 'Smith'}).name).toEqual('John Smith');
    expect(getUserNames({...user, full_name: 'John Smith'}).name).toEqual('John Smith');
  });

  it(`Return --- --- placeholder as user's name when has neither full_name nor email`, () => {
    const user = {} as IUser;
    expect(getUserNames(user).name).toEqual('--- ---');
  });
});

describe('formatPrice', () => {
  it('Should format floating point values to currency amount', () => {
    const formatPairs = [
      [0, '$ 0.00'],
      [19, '$ 19.00'],
      [19.1, '$ 19.10'],
      [1000, '$ 1,000.00'],
      [1000.45, '$ 1,000.45'],
      [1999555, '$ 1,999,555.00'],
      [1999555.32, '$ 1,999,555.32'],
      [-1999555.32, '-$ 1,999,555.32']
    ];

    formatPairs.forEach(p => {
      expect(formatPrice(p[0])).toEqual(p[1]);
      expect(formatPrice(p[0].toString())).toEqual(p[1]);
    });
  });
});

describe('sortedByDateGroups', () => {
  it('Should return correct amount of result items', () => {
    const testPropName = 'date';
    const testData = [
      {
        [testPropName]: '2019-02-15T12:00:42Z'
      },
      {
        [testPropName]: '2019-02-15T06:59:28Z'
      },
      {
        [testPropName]: '2018-02-11T00:38:29Z'
      }
    ];

    expect(sortedByDateGroups(testData, testPropName)).toHaveLength(2);
    expect(sortedByDateGroups(testData, testPropName)[0].items).toHaveLength(2);
    expect(sortedByDateGroups(testData, testPropName)[1].items).toHaveLength(1);
  });
});

describe('getFinanceItemStatusList', () => {
  it('Should return a string array', () => {
    const testString1 = faker.random.words();
    const testString2 = faker.random.words();
    const testData = [
      {},
      {latest_status: 4},
      {latest_status: {status: testString1}},
      {virtual_status: testString2},
      {latest_status: {status: testString1}, virtual_status: testString2},
      {latest_status: {status: testString1}, virtual_status: testString1}
    ];

    expect(getFinanceItemStatusList(testData[0] as IStatusesEntity)).toHaveLength(0);
    expect(getFinanceItemStatusList(testData[1] as IStatusesEntity)).toHaveLength(0);
    expect(getFinanceItemStatusList(testData[2] as IStatusesEntity)).toEqual([testString1]);
    expect(getFinanceItemStatusList(testData[3] as IStatusesEntity)).toEqual([testString2]);
    expect(getFinanceItemStatusList(testData[4] as IStatusesEntity)).toEqual([testString1, testString2]);
    expect(getFinanceItemStatusList(testData[5] as IStatusesEntity)).toEqual([testString1]);
  });
});
