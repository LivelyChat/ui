import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url, params }) => {
  const { queryClient, api } = await parent();

  const selfKey = `self.${params.platform}`;
  const self = url.searchParams.get(selfKey) ?? localStorage.getItem(selfKey);
  const secret = localStorage.getItem(`secret.${params.platform}.${params.chat}`) ?? undefined;

  return {
    queryClient,
    api,
    platform: params.platform,
    chat: params.chat,
    secret,
    self
  };
};
