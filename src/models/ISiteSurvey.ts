export interface IFlooringType {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface IBaseRoomType {
  job_id: string | number;
  flooring_type_id: string | number;
  name: string;
}

export interface IRoomType extends IBaseRoomType {
  id: string | number;
  job_id: string | number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ISurveyType {
  allQuestions: any[];
  jobQuestions: any[];
  jobRooms: IRoomType[];
}

export interface IQuestion {
  id: number;
  is_active: boolean;
  name: string;
  site_survey_question_options: IQuestionAnswerOption[];
}

export interface IQuestionAnswerOption {
  id: number;
  name: string;
  site_survey_question_id: number;
}
