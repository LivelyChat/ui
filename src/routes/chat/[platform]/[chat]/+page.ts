import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
  const { queryClient, api } = await parent();

  return {
    queryClient,
    api,
    platform: params.platform,
    chat: params.chat
  };
};
