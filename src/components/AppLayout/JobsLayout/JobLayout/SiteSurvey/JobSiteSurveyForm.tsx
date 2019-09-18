import * as React from 'react';
import {ConfigProps, Field, FieldArray, InjectedFormProps, reduxForm, WrappedFieldArrayProps} from 'redux-form';
import {IFlooringType, IRoomType} from 'src/models/ISiteSurvey';
import styled from 'styled-components';
import Select from 'src/components/Form/Select';
import Input from 'src/components/Form/Input';
import Typography from 'src/constants/Typography';
import Icon, {IconName} from 'src/components/Icon/Icon';
import StripedTable from 'src/components/Tables/StripedTable';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {debounce} from 'lodash';
import ColorPalette from 'src/constants/ColorPalette';
import ModalJobSiteSurvey, {
  FormValueName,
  IFormValues
} from 'src/components/Modal/Jobs/MadalJobSiteSurvey/ModalJobSiteSurvey';
import {IJob} from 'src/models/IJob';
import JobSiteSurveyService from 'src/services/JobSiteSurveyService';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {openModal} from 'src/redux/modalDucks';

const IconWrapper = styled.div<{disabled?: boolean}>`
  cursor: pointer;
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  display: flex;
  justify-content: space-between;
`;

const QuestionTable = styled(StripedTable)`
  th:last-child {
    width: 30%;
    min-width: 160px;
    padding-right: 80px;
  }
  td:first-child {
    font-weight: ${Typography.weight.bold};
    &.no-items {
      color: ${ColorPalette.gray4};
      font-weight: ${Typography.weight.normal};
      text-align: center;
    }
  }
  .form-group {
    max-width: 200px;
  }
`;

const RoomsTable = styled(StripedTable)`
  .form-group {
    max-width: 200px;
  }
  th {
    &:first-child {
      width: 50%;
      max-width: 320px;
    }
    &:last-child {
      width: 78px;
    }
  }
  td:first-child {
    input {
      max-width: 250px;
    }
  }
`;

const AddRoomButton = styled.span`
  margin-bottom: ${Typography.size.smaller};
  display: inline-block;
  color: ${ColorPalette.blue4};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const TableFormHeader = styled.h2`
  text-transform: uppercase;
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.normal};
  color: ${ColorPalette.gray4};
  margin-top: 60px;
`;

interface IProps {
  job: IJob | null;
  jobRooms: any[];
  flooringTypes: any[];
  removingRooms: number[];
  surveyIsReady: boolean;
  disabled?: boolean;
  onSubmit: (data: any) => Promise<any>;
  onRemoveRoom: (id: string | number) => Promise<any> | void;
  questionsForAdd: any[];
  loadSurvey: (jobIs: number | string) => any;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  addNewRoom: boolean;
  showModal: boolean;
}

class JobSiteSurveyFormForm extends React.PureComponent<
  IProps & Partial<ConfigProps> & InjectedFormProps<any, IProps> & IConnectProps,
  IState
> {
  public state = {addNewRoom: false, showModal: false};

  private roomsCountTouched: boolean = false;
  private clippedRoom: {name?: string; flooring_type?: any} = {};

  private addNewRoom = () => {
    this.setState({addNewRoom: true});
  };

  private static customTypeSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      maxWidth: '200px',
      borderColor: ColorPalette.gray2
    })
  };

  private onSaveRoom = (index: number) => (data: any) => {
    const savedRoom = data.rooms[index];
    const isNewRoom = savedRoom.name && savedRoom.flooring_type;
    if (isNewRoom) {
      return this.props.onSubmit({rooms: [savedRoom]});
    }
    return Promise.reject();
  };

  private onSaveQuestions = (data: any) => {
    const answeredQuestions = data.questions.filter((row: any, index: number) => {
      const initialValue = this.props.initialValues.questions[index];
      return (
        !!row.site_survey_question_option_id &&
        initialValue &&
        (row.site_survey_question_option_id.value !== initialValue.site_survey_question_option_id.value ||
          row.answer !== initialValue.answer)
      );
    });

    this.props.onSubmit({questions: answeredQuestions});
  };

  private renderNoQuestions = () => {
    return (
      <tr>
        <td className="no-items" colSpan={3}>
          No questions...
        </td>
      </tr>
    );
  };

  private renderNoRooms = () => {
    return (
      <tr>
        <td className="no-items" colSpan={3}>
          No rooms...
        </td>
      </tr>
    );
  };

  private renderQuestionsRows = (context: IUserContext) => (questionProps: WrappedFieldArrayProps<any>) => {
    const {fields} = questionProps;
    const allFields = fields.getAll();
    if (!allFields || allFields.length === 0) {
      this.props.initialValues.questions.forEach((q: any) => fields.push(q));
    }
    const rows = fields.map((row, index) => {
      const question = fields.getAll()[index];

      return (
        <tr key={`qn-row-${index}`}>
          <td>{question.name}</td>
          <td>
            {question.site_survey_question_options.length ? (
              <Field
                name={`${row}.site_survey_question_option_id`}
                placeholder="Select"
                component={Select}
                options={question.site_survey_question_options.map((option: {id: number; name: string}) => ({
                  value: option.id,
                  label: option.name
                }))}
                onChange={() => setTimeout(this.props.handleSubmit(this.onSaveQuestions))}
                selectStyles={JobSiteSurveyFormForm.customTypeSelectStyles}
              />
            ) : (
              <Field
                name={`${row}.answer`}
                placeholder="Answer"
                component={Input}
                onChange={this.debounceInputChange}
              />
            )}
          </td>
          <td>
            <IconWrapper disabled={!context.has(Permission.JOBS_UPDATE)}>
              <Icon name={IconName.Remove} onClick={() => this.removeQuestion(question)} />
            </IconWrapper>
          </td>
        </tr>
      );
    });
    return <>{rows}</>;
  };

  private debounceInputChange = debounce(() => setTimeout(this.props.handleSubmit(this.onSaveQuestions)), 1000);

  private renderRoomFields = () => {
    return (roomProps: WrappedFieldArrayProps<any>) => {
      const {fields} = roomProps;
      if (this.state.addNewRoom) {
        fields.push(this.clippedRoom);
        this.clippedRoom = {};
        this.setState({addNewRoom: false});
      }
      const rows = fields.map((row, index) => {
        const submitRoomsAndRemoveRow = (data: any) => {
          this.props
            .handleSubmit(this.onSaveRoom(index))()
            .then(() => fields.remove(index));
        };
        return (
          <tr key={`rooms-row-${index}`}>
            <td>
              <Field
                name={`${row}.name`}
                placeholder="Enter a name..."
                component={Input}
                onBlur={submitRoomsAndRemoveRow}
              />
            </td>
            <td>
              <Field
                name={`${row}.flooring_type`}
                placeholder="Select type"
                component={Select}
                options={this.flooringOptions}
                onBlur={submitRoomsAndRemoveRow}
                selectStyles={JobSiteSurveyFormForm.customTypeSelectStyles}
              />
            </td>
            <td>
              {this.renderRoomControls(
                () => {
                  fields.remove(index);
                },
                () => {
                  fields.push({...fields.getAll()[index]});
                }
              )}
            </td>
          </tr>
        );
      });
      return <>{rows}</>;
    };
  };

  private renderRoomsRows = (allowManage: boolean) =>
    this.props.jobRooms
      ? this.props.jobRooms.map((room: IRoomType, index: number) => {
          const flooringType = this.props.flooringTypes.find((f: IFlooringType) => f.id === room.flooring_type_id);
          const isRemovingNow = this.props.removingRooms.includes(Number(room.id));
          const onRemove = () => this.props.onRemoveRoom(room.id);
          const onCopy = () =>
            this.copyExistRoom({
              name: room.name,
              flooring_type: this.flooringOptions.find(fo => fo.value === room.flooring_type_id)
            });
          return (
            <tr key={`room-tr-${index}`}>
              <td>{room.name}</td>
              <td>{flooringType ? flooringType.name : 'Unknown'}</td>
              <td>{allowManage && this.renderRoomControls(onRemove, onCopy, isRemovingNow)}</td>
            </tr>
          );
        })
      : null;

  private copyExistRoom = (room: {name: string; flooring_type: any}) => {
    this.clippedRoom = room;
    this.addNewRoom();
  };

  private renderRoomControls = (onRemove: () => any, onCopy: (() => any) | null, disabled: boolean = false) => {
    const removeRoom = disabled ? () => null : onRemove;
    const copyRoom = disabled ? () => null : onCopy ? onCopy : () => null;
    return (
      <IconWrapper disabled={disabled || this.props.disabled}>
        <Icon name={IconName.CopyPaste} onClick={copyRoom} />
        <Icon name={IconName.Remove} onClick={removeRoom} />
      </IconWrapper>
    );
  };

  private get flooringOptions() {
    return this.props.flooringTypes.map((f: IFlooringType) => ({
      value: f.id,
      label: f.name
    }));
  }

  public componentDidUpdate(prevProps: IProps & InjectedFormProps<any, IProps>) {
    if (!this.props.disabled) {
      const justLoaded = !prevProps.surveyIsReady && this.props.surveyIsReady;
      if (justLoaded && !this.roomsCountTouched && this.props.jobRooms.length === 0) {
        this.addNewRoom();
        this.roomsCountTouched = true;
      }
    }
  }

  private removeQuestion = async (data: any) => {
    const {dispatch, loadSurvey} = this.props;

    const res = await dispatch(openModal('Confirm', 'Delete question?'));

    if (res) {
      await JobSiteSurveyService.detachQuestionOption(data.job_id, data.id);
      loadSurvey(data.job_id);
    }
  };

  private openModal = () => {
    this.setState({showModal: true});
  };

  private closeModal = () => {
    this.setState({showModal: false});
  };

  private onQuestionAdd = async (data: IFormValues) => {
    const {job, loadSurvey} = this.props;
    const params = {} as any;

    if (data[FormValueName.Answer]) {
      params.answer = data[FormValueName.Answer];
    }

    if (data[FormValueName.QuestionAnswer]) {
      params.site_survey_question_option_id = data[FormValueName.QuestionAnswer].id;
    }

    if (job) {
      await JobSiteSurveyService.attachQuestionOption(job.id, data[FormValueName.Question].id, params);
      this.closeModal();
      loadSurvey(job.id);
    }
  };

  public render() {
    const {questionsForAdd} = this.props;
    const {showModal} = this.state;

    return (
      <UserContext.Consumer>
        {context => (
          <>
            {showModal && (
              <ModalJobSiteSurvey
                isOpen={showModal}
                onClose={this.closeModal}
                questions={questionsForAdd}
                onSubmit={this.onQuestionAdd}
              />
            )}
            <form>
              <TableFormHeader>Triage questions</TableFormHeader>
              <QuestionTable className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Question</th>
                    <th scope="col" colSpan={2}>
                      Customer Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.initialValues.questions.length > 0 ? (
                    <FieldArray name="questions" component={this.renderQuestionsRows(context)} />
                  ) : (
                    this.renderNoQuestions()
                  )}
                </tbody>
              </QuestionTable>
              {!this.props.disabled && context.has(Permission.JOBS_UPDATE) && (
                <AddRoomButton onClick={this.openModal}>Add question</AddRoomButton>
              )}

              <TableFormHeader>Rooms</TableFormHeader>
              <RoomsTable className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Flooring Type</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.props.disabled && this.props.jobRooms.length === 0
                    ? this.renderNoRooms()
                    : this.renderRoomsRows(context.has(Permission.JOBS_AREAS_MANAGE))}
                  <FieldArray name="rooms" component={this.renderRoomFields()} />
                </tbody>
              </RoomsTable>
              {!this.props.disabled && context.has(Permission.JOBS_AREAS_MANAGE) && (
                <AddRoomButton onClick={this.addNewRoom}>Add room</AddRoomButton>
              )}
            </form>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<IProps & Partial<ConfigProps>>>(
  reduxForm<any, IProps & Partial<ConfigProps>>({
    form: 'JobSiteSurveyForm',
    enableReinitialize: true
  }),
  connect()
)(JobSiteSurveyFormForm);
