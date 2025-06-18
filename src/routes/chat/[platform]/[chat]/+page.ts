import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
  const { api } = await parent();

  return {
    api,
    platform: params.platform,
    chat: params.chat
  };
};
