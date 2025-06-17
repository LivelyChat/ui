<script lang="ts">
  import '../app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
  <title>LivelyChat</title>
  <meta property="og:title" content="LivelyChat" />
  <meta property="og:type" content="website" />
</svelte:head>

<QueryClientProvider client={data.queryClient}>
  {@render children()}
</QueryClientProvider>
