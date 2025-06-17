import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { queryClient, api } = await parent();

  await queryClient.prefetchQuery(api.home.overview({}));

  return {
    queryClient,
    api
  };
};
