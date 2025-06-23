import { browser } from '$app/environment';
import API from '$lib/api';
import { QueryClient } from '@tanstack/svelte-query';

export const load = async ({ fetch }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        refetchOnWindowFocus: false
      }
    }
  });
  const api = new API(fetch);

  return { queryClient, api };
};
