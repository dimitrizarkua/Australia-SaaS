import TagService, {ITagsSuccess} from 'src/services/TagService';
import {reduxWrap, IReturnType, createAsyncAction} from 'src/redux/reduxWrap';

const LOAD = 'Steamatic/Tags/Job/LOAD';
const LOAD_COMPLETE = 'Steamatic/Tags/Job/LOAD_COMPLETE';
const RESET = 'Steamatic/Tags/Job/RESET';
const ERROR = 'Steamatic/Tags/Job/ERROR';

const config = {
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
};

export type JobTagsState = IReturnType<ITagsSuccess>;

export default reduxWrap<ITagsSuccess>(config);

export const loadJobTags = () =>
  createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => TagService.searchTags({type: 'job'}));
