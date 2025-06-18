<script lang="ts">
  import '../app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
</script>

<QueryClientProvider client={data.queryClient}>
  {@render children()}
</QueryClientProvider>
