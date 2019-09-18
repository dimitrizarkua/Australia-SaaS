import * as React from 'react';
import {IModal} from 'src/models/IModal';
import {IQuestion, IQuestionAnswerOption} from 'src/models/ISiteSurvey';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {Field, InjectedFormProps, reduxForm} from 'redux-form';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Select from 'src/components/Form/Select';
import {required} from 'src/services/ValidationService';
import Input from 'src/components/Form/Input';

export enum FormValueName {
  Question = 'question',
  Answer = 'answer',
  QuestionAnswer = 'question_answer'
}

interface IInputProps {
  questions: IQuestion[];
}

export interface IFormValues {
  [FormValueName.Question]: IQuestion;
  [FormValueName.Answer]: string;
  [FormValueName.QuestionAnswer]: IQuestionAnswerOption;
}

type IProps = IModal & IInputProps;

export const FormName = 'AddQuestionToJobForm';

interface IState {
  answerOptions: IQuestionAnswerOption[];
  question?: IQuestion;
}

class ModalJobSiteSurvey extends React.PureComponent<IProps & InjectedFormProps<IFormValues, IProps>, IState> {
  public state = {
    answerOptions: [],
    question: undefined
  };

  private onQuestionChange = (question: any) => {
    const q = question as IQuestion;

    this.setState({question: q});
    this.setState({answerOptions: q.site_survey_question_options || []});
  };

  private renderBody = () => {
    const {questions, handleSubmit} = this.props;
    const {question, answerOptions} = this.state;

    return (
      <form id={FormName} onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-7">
            <Field
              name={FormValueName.Question}
              component={Select}
              options={questions}
              placeholder="Select question"
              getOptionValue={(q: IQuestion) => q.id}
              getOptionLabel={(q: IQuestion) => q.name}
              label="Question"
              validate={required}
              onChange={this.onQuestionChange}
            />
          </div>
          {question && (
            <div className="col-5">
              {answerOptions.length > 0 ? (
                <Field
                  name={FormValueName.QuestionAnswer}
                  component={Select}
                  options={answerOptions}
                  placeholder="Select Answer"
                  getOptionValue={(q: IQuestionAnswerOption) => q.id}
                  getOptionLabel={(q: IQuestionAnswerOption) => q.name}
                  label="Answer"
                  validate={required}
                />
              ) : (
                <Field
                  name={FormValueName.Answer}
                  component={Input}
                  placeholder="Type answer"
                  label="Answer"
                  validate={required}
                />
              )}
            </div>
          )}
        </div>
      </form>
    );
  };

  private renderFooter = () => {
    return (
      <PrimaryButton className="btn btn-primary" form={FormName}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, onClose, submitting} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          loading={submitting}
          footer={this.renderFooter()}
          body={this.renderBody()}
          title="Add Question"
        />
      </Modal>
    );
  }
}

export default reduxForm<IFormValues, IProps>({
  form: FormName
})(ModalJobSiteSurvey);
