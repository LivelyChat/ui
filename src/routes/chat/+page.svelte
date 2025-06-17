<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    if (browser) {
      goto('/');
    }
  });
</script>
