import Api, { createQueryCreator, type R } from '.';

export interface Overview {
  chatCount: number;
  messageCount: number;
}

export default class HomeApi {
  constructor(private api: Api) {}

  overview = createQueryCreator('home.overview', (): R<Overview> => this.api.GET('/'));
}
