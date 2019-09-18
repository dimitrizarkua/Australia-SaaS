import {createValidator, required} from 'src/services/ValidationService';
import {IFormData} from './JobContactsForm';

export default createValidator<IFormData>({}, (data, errors) => {
  errors.contacts = [] as any;
  data.contacts.forEach((c, index) => {
    if (c.contact) {
      const assignmentTypeError = required(c.assignment_type);
      if (assignmentTypeError) {
        errors.contacts![index] = {
          assignment_type: assignmentTypeError
        };
      }
    }
  });
  return errors;
});
