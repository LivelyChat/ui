import Api, { createQueryCreator, stringifyQueryParams, type R } from '.';

interface QueryOpts {
  platform: string;
  chatId: string;
  secret?: string;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
}

export default class QqApi {
  constructor(private api: Api) {}

  groupInfo = createQueryCreator(
    'qq.group.info',
    (opts: QueryOpts): R<Group> =>
      this.api.GET(`/qq/group/${opts.chatId}?` + stringifyQueryParams(opts))
  );
}
