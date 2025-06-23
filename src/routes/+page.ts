import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { api } = await parent();

  return {
    api
  };
};
