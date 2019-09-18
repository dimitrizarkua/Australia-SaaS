import * as React from 'react';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IAppState} from 'src/redux';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {
  reset,
  loadJobSiteSurvey,
  sendSurveyAnswer,
  sendJobRoom,
  removeJobRoom,
  ISurveyState
} from 'src/redux/currentJob/currentJobSurvey';
import {IBaseRoomType} from 'src/models/ISiteSurvey';
import JobSiteSurveyForm from 'src/components/AppLayout/JobsLayout/JobLayout/SiteSurvey/JobSiteSurveyForm';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import {RouteComponentProps, withRouter} from 'react-router';

const SurveyFormContainer = styled.div`
  margin: 45px auto;
`;

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
  currentJob: ICurrentJob;
  currentJobSurvey: ISurveyState;
}

interface IRouteParams {
  id: number;
}

class JobSiteSurvey extends React.PureComponent<IConnectProps & RouteComponentProps<IRouteParams>> {
  public componentDidMount() {
    const {match} = this.props;

    this.loadSurvey(match.params.id);
  }

  public componentDidUpdate(prevProps: RouteComponentProps<IRouteParams>) {
    const {match} = this.props;
    const prevId = prevProps.match.params.id;
    if (match.params.id !== prevId) {
      this.loadSurvey(match.params.id);
    }
  }

  private loadSurvey = async (jobId: number | string) => {
    const {dispatch, currentJobSurvey} = this.props;
    if (currentJobSurvey.loading) {
      return Promise.resolve();
    }
    dispatch(reset());
    await dispatch(loadJobSiteSurvey(jobId));
  };

  private submitSurveyForm = (data: {rooms?: any[]; questions?: any[]}) => {
    const promises = [] as Array<Promise<any>>;

    console.log(data);

    if (data.rooms) {
      promises.push(this.submitRooms(data.rooms));
    }
    if (data.questions) {
      promises.push(this.submitQuestions(data.questions));
    }
    return Promise.all(promises);
  };

  private submitRooms = async (rooms: Array<{flooring_type: any; name: string}>) => {
    const {dispatch, currentJob} = this.props;
    const jobId = currentJob.data!.id;
    const promises = rooms.map(room => {
      const roomData: IBaseRoomType = {
        flooring_type_id: room.flooring_type.value,
        name: room.name,
        job_id: jobId
      };
      return dispatch(sendJobRoom(jobId, roomData));
    });
    return Promise.all(promises);
  };

  private submitQuestions = (questions: any[]) => {
    const {dispatch, currentJob} = this.props;
    const jobId = currentJob.data!.id;
    const promises = questions.map(q => {
      const fieldData = q.site_survey_question_option_id;
      const answer = q.answer;
      console.log(fieldData, answer);
      if ((fieldData && fieldData.value) || answer) {
        return dispatch(sendSurveyAnswer(jobId, q.id, {optionId: fieldData.value, answer}));
      }
      return Promise.resolve();
    });
    return Promise.all(promises);
  };

  private removeRoom = (id: string | number) => {
    const {dispatch, currentJob} = this.props;
    const jobId = currentJob.data!.id;
    dispatch(removeJobRoom(jobId, id));
  };

  private get questions() {
    const {allQuestions, jobQuestions} = this.props.currentJobSurvey.data;
    if (!jobQuestions || !allQuestions) {
      return [];
    }
    return jobQuestions.map((jq: any) => ({
      ...jq,
      ...allQuestions.find((aq: {id: number}) => aq.id === jq.site_survey_question_id)
    }));
  }

  private get formInitialValues() {
    return {
      questions: this.questions
        .map((q: any) => {
          const selectedOption = q.site_survey_question_options.find(
            (o: any) => o.id === q.site_survey_question_option_id
          );
          const selectedOptionLabel = selectedOption && selectedOption.name;
          const initialOptionValue = {
            value: q.site_survey_question_option_id,
            label: selectedOptionLabel
          };
          return {
            ...q,
            site_survey_question_option_id: initialOptionValue
          };
        })
        .sort((q1: any, q2: any) => q1.site_survey_question_id - q2.site_survey_question_id)
    };
  }

  public render() {
    const survey = this.props.currentJobSurvey.data;
    const {jobRooms, flooringTypes, allQuestions} = survey;
    const {loading, ready} = this.props.currentJobSurvey;
    const removingRooms = this.props.currentJobSurvey.removing.rooms;
    const disabled = this.props.currentJob.data && this.props.currentJob.data.edit_forbidden;

    return (
      <ColoredDiv padding="0 30px" overflow="visible">
        <SurveyFormContainer>
          {loading && <BlockLoading size={40} color={ColorPalette.white} />}
          <JobSiteSurveyForm
            job={this.props.currentJob.data}
            onSubmit={this.submitSurveyForm}
            onRemoveRoom={this.removeRoom}
            removingRooms={removingRooms}
            jobRooms={jobRooms}
            flooringTypes={flooringTypes}
            surveyIsReady={ready.surveyIsReady}
            initialValues={this.formInitialValues}
            disabled={!!disabled}
            questionsForAdd={allQuestions || []}
            loadSurvey={this.loadSurvey}
          />
        </SurveyFormContainer>
      </ColoredDiv>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  currentJob: state.currentJob,
  currentJobSurvey: state.currentJobSurvey
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(JobSiteSurvey);
