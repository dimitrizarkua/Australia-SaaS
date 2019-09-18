import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalJobNotesAndRepliesPage as JobNotesAndRepliesPage} from '../JobNotesAndRepliesPage';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

describe('JobNotesAndRepliesPage', () => {
  let props: any;
  let context: IUserContext;

  beforeEach(() => {
    props = {
      location: {
        search: ''
      },
      editedNote: {
        note: '',
        documents: []
      },
      job: {
        id: 1,
        data: {
          data: {
            edit_forbidden: false
          }
        }
      },
      notesAndReplies: {
        data: [],
        loading: false
      },
      match: {params: 1},
      dispatch: () => Promise.resolve()
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    const component = shallow(<JobNotesAndRepliesPage {...props} />);
    return (component.find(UserContext.Consumer) as any).renderProp('children')(context);
  };

  it('render NOT editor if has NO query param in the url', () => {
    const component = renderComponent();
    expect(component.find(NoteComponent).length).toEqual(0);
  });

  it('render note editor if has query param in the url', () => {
    props.location.search = '?note=true';
    const component = renderComponent();
    expect(component.find(NoteComponent).length).toEqual(1);
  });

  it('render NOT editor if has NO permission', () => {
    context.has = (permission: Permission) => permission !== Permission.NOTES_UPDATE;
    const component = renderComponent();
    expect(component.find(NoteComponent).length).toEqual(0);
  });
});
