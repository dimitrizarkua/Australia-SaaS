import * as React from 'react';
import {reduxForm, Field, InjectedFormProps} from 'redux-form';
import {compose} from 'redux';
import DateTime from 'src/components/Form/DateTime';
import TextEditorField from 'src/components/Form/TextEditorField';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {required, requiredHtml} from 'src/services/ValidationService';
import {Moment} from 'moment';
import moment from 'moment';

interface IProps {
  onCancel?: () => void;
  onSubmit: (data: IFormData) => void;
}

export interface IFormData {
  meeting_date: Moment;
  note: string;
}

const EditorWrapper = styled.div`
  margin-top: 25px;
  border: 1px solid ${ColorPalette.gray2};
`;

const EditorFooter = styled.div`
  background: ${ColorPalette.orange0};
  text-align: right;
  height: 45px;
`;

const SubmitButton = styled.button`
  background: ${ColorPalette.orange1};
  color: ${ColorPalette.white};
  padding: 0 25px;
  border: 0;
  border-radius: 0;
  height: 100%;
  cursor: pointer;
`;

class ContactMeetingForm extends React.PureComponent<InjectedFormProps<IFormData, IProps> & IProps> {
  public componentDidMount() {
    const {change} = this.props;
    change('meeting_date', moment());
  }

  public render() {
    return (
      <form onSubmit={this.props.handleSubmit} autoComplete="off">
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <Field
              name="meeting_date"
              label="Meeting Date"
              validate={required}
              futureEnabled={true}
              showTime={true}
              component={DateTime}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <EditorWrapper>
              <Field
                name="note"
                placeholder="Enter text here..."
                postDocument={() => null}
                color={ColorPalette.orange0}
                validate={requiredHtml}
                disableAttachments={true}
                disableMentionControl={true}
                disableTemplatesControl={true}
                onCancel={this.props.onCancel}
                component={TextEditorField}
              />
              <EditorFooter>
                <SubmitButton type="submit">Add Meeting</SubmitButton>
              </EditorFooter>
            </EditorWrapper>
          </div>
        </div>
      </form>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  reduxForm<IFormData, IProps>({
    form: 'MeetingForm'
  })
)(ContactMeetingForm);
