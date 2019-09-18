import * as React from 'react';
import {reduxForm} from 'redux-form';
import {Field, InjectedFormProps} from 'redux-form';
import TextArea from 'src/components/Form/TextArea';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';

export interface ILookupFormProps {
  term: string;
}

class LookupInvoiceForm extends React.PureComponent<InjectedFormProps<ILookupFormProps>> {
  public render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <Field
          name="term"
          label="Lookup Invoices"
          type="textarea"
          placeholder="Enter or paste all invoice numbers here..."
          component={TextArea}
          className="form__dark"
        />
        <PrimaryButton type="submit" className="btn btn-primary">
          Lookup
        </PrimaryButton>
      </form>
    );
  }
}

export default reduxForm<ILookupFormProps>({
  form: 'LookupInvoiceForm'
})(LookupInvoiceForm);
