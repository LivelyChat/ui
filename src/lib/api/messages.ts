import Api, { createQueryCreator, stringifyQueryParams, type R } from '.';

interface QueryOpts {
  platform: string;
  chatId: string;
  secret?: string;
  before?: number;
  limit?: number;
}

export interface User {
  id: string;
  avatar: string;
  username: string;
  nickname: string;
  role?: string;
}

export interface Message {
  id: string;
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any[];
  timestamp: number;
  sender: User;
  chatId: string;
  platform: string;
}

export interface MessageList {
  total: number;
  messages: Message[];
}

export default class MessagesApi {
  constructor(private api: Api) {}

  list = createQueryCreator(
    'messages.list',
    (opts: QueryOpts): R<MessageList> => this.api.GET('/messages?' + stringifyQueryParams(opts))
  );
}
