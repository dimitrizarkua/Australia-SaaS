import {IContactAssignment} from 'src/models/IJob';

const hydrate = (assignment: IContactAssignment): IContactAssignment => {
  return {
    ...assignment,
    contact: {
      id: assignment.contact_id,
      first_name: assignment.first_name,
      last_name: assignment.last_name,
      trading_name: assignment.trading_name,
      legal_name: assignment.legal_name,
      contact_type: assignment.contact_type,
      tags: assignment.tags
    }
  };
};

export default {
  hydrate
};
