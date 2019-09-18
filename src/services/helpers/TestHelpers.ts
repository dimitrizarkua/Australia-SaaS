import faker from 'faker';
import moment from 'moment';
import {IMentionsUser, IUser} from 'src/models/IUser';
import {IInvoiceListItem} from 'src/models/FinanceModels/IInvoices';
import {ILocation} from 'src/models/IAddress';

export function getFakeUser(): IUser {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const fullName = `${firstName} ${lastName}`;
  return {
    id: faker.random.number({min: 0, max: 9999}),
    email: faker.internet.email(),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    locations: getFakeLocation(),
    working_hours_per_week: faker.random.number(),
    avatar_url: faker.image.avatar(),
    contact_id: faker.random.number(),
    contact: null
  };
}

export function getFakeLocation(): ILocation[] {
  return [
    {
      id: faker.random.number({min: 0, max: 9999}),
      name: faker.lorem.word(),
      code: faker.lorem.word(),
      primary: faker.random.boolean(),
      tz_offset: 600
    }
  ];
}

export function getFakeMentionUser(): IMentionsUser {
  return {
    ...getFakeUser(),
    created_at: moment(faker.date.past()).format(),
    updated_at: moment(faker.date.past()).format()
  };
}

export function getFakeInvoices(params: {min: number; max: number}, status?: string): IInvoiceListItem[] {
  const {min, max} = params;
  const count = faker.random.number({min, max});
  const invoices = [];
  let newId = 0;
  for (let i = 0; i < count; i++) {
    newId += faker.random.number({min: 1, max: 20});
    const fakeJob = {
      id: faker.random.number({min: 1, max: 9999}),
      location_code: faker.lorem.word(),
      insurer_name: `${faker.name.firstName()} ${faker.name.lastName()}`
    };
    const fakeInvoice: IInvoiceListItem = {
      id: newId,
      recipient_name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      due_at: moment(faker.date.past()).format(),
      total_amount: faker.random.number(),
      balance_due: faker.random.number(),
      job: faker.random.boolean() ? fakeJob : null,
      latest_status: {
        id: faker.random.number({min: 1, max: 9999}),
        invoice_id: faker.random.number({min: 1, max: 9999}),
        user_id: faker.random.number({min: 1, max: 9999}),
        status: status || faker.random.arrayElement(['draft', 'paid', 'unpaid', 'overdue'])
      }
    };
    invoices.push(fakeInvoice);
  }
  return invoices;
}
