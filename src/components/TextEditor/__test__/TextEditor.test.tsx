import * as React from 'react';
import {mount} from 'enzyme';
import {InternalTextEditor as TextEditor} from '../TextEditor';
import {getFakeMentionUser} from 'src/services/helpers/TestHelpers';

describe('TextEditor', () => {
  const onTextEditorChange = jest.fn();

  let props: any;

  beforeEach(() => {
    props = {
      value: '<p></p>',
      color: '#fff',
      onChange: onTextEditorChange,
      postDocument: jest.fn(),
      users: {
        loading: false,
        ready: false,
        reset: jest.fn(),
        init: jest.fn()
      },
      dispatch: jest.fn()
    };
  });

  it('should add and parse mentions', () => {
    const component = mount(<TextEditor {...props} />);
    const mentionUser = getFakeMentionUser();
    (component.instance() as any).onSelectMentionUser(mentionUser);
    (component.instance() as any).onChange(component.state('editorState'));
    expect(onTextEditorChange.mock.calls[0][0]).toContain(`[USER_ID:${mentionUser.id}]`);
  });
});
