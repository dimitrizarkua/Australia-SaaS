import {combineReducers} from 'redux';
import {currentAR} from 'src/redux/assessmentReports/currentAS';
import {IReturnType} from 'src/redux/reduxWrap';
import {IAssessmentReport} from 'src/models/AssessmentReportModels/IAssessmentReport';

export interface IAssessmentReportsStore {
  currentAR: IReturnType<IAssessmentReport>;
}

export const prefix = 'Steamatic/UsageAndActuals/AssessmentReports/';

export default combineReducers({
  currentAR
});
