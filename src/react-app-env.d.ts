/// <reference types="react-scripts" />
/// <resources type="react" />
/// <resources type="draft-js" />
declare module 'draft-js-plugins-editor' {
  import {EditorState} from 'draft-js';

  export type PluginsEditorProps =
    | Draft.EditorProps
    | {
        plugins: any;
      };

  export default class PluginsEditor extends React.Component<PluginsEditorProps, Draft.EditorState> {
    public focus(): void;
    public blur(): void;
  }
  export function createEditorStateWithText(text: string): PluginsEditor;
  export function composeDecorators(...func: any[]): (...args: any[]) => any;
}

// @todo flesh out component type
declare module 'draft-js-emoji-plugin' {
  function createEmojiPlugin(config?: object): any;
  export type EmojiSuggestions = any;
  export default createEmojiPlugin;
}

declare module 'draft-js-mention-plugin' {
  // @todo missing defaultTheme
  // @todo missing defaultSuggestionsFilter

  // tslint:disable-next-line
  interface Props {
    suggestions: any[];
    onAddMention: (mention: any) => void;
    entryComponent: (...props: any[]) => JSX.Element;
    entityMutability: string;
  }

  // tslint:disable-next-line
  interface State {
    isActive: boolean;
    focusedOptionIndex: number;
  }

  export function defaultSuggestionsFilter(value: any, mentions: any): any;
  export type MentionSuggestions<T> = React.Component<Props, State>;
  export default function createMentionPlugin(config?: object): any;
}

declare module 'draft-convert' {
  export function convertToHTML(state: any): any;
  export function convertFromHTML(html: string): any;
  export function parseHTML(html: string): any;
}

declare module 'laravel-echo';

declare module 'credit-card' {
  export function sanitizeNumberString(num: string);
  export function validate(card: any, options?: any);
  export function isValidExpiryMonth(month: number | string, options?: any);
  export function isValidExpiryYear(year: number | string, options?: any);
  export function isExpired(month: number, year: number);
  export function luhn(num: string);
}
