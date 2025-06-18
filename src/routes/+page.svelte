<script lang="ts">
  import { GITHUB_LINK } from '$lib';
  import { createQuery } from '@tanstack/svelte-query';
  import { untrack } from 'svelte';

  let { data } = $props();
  let { api } = $derived(data);

  let showCollapse = $state(false);
  let address = $state('');
  let secret = $state('');
  let platform = $state('');
  let chat = $state('');
  let self = $state('');
  let url: string | null = $derived.by(() => {
    if (!address) return null;

    let result: string | null = null;
    untrack(() => {
      try {
        const url = new URL(address.replace('private:', 'private__'));
        const parts = url.pathname.replace('/chat/', '').split('/').filter(Boolean);
        if (parts.length === 2) {
          if (url.searchParams.has('secret')) {
            secret = url.searchParams.get('secret') || '';
          }
          parts[1] = parts[1].replace('private__', 'private:');
          platform = parts[0];
          chat = parts[1];
          result = url.origin + '/chat/' + parts.join('/');
        }
      } catch {
        const parts = address.split('/').filter(Boolean);
        if (parts.length === 2) {
          platform = parts[0];
          chat = parts[1];
          result = '/chat/' + parts.join('/');
        }
      }
    });
    return result;
  });

  let overviewQuery = $derived(createQuery(api.home.overview({})));

  const handleGo = () => {
    if (secret) localStorage.setItem(`secret.${platform}.${chat}`, secret);
    localStorage.setItem(`self.${platform}`, self || '');
    if (url) location.href = url;
  };

  $effect(() => {
    if (platform) {
      untrack(() => {
        if (localStorage.getItem(`self.${platform}`)) {
          self = localStorage.getItem(`self.${platform}`) || '';
        } else {
          self = '';
        }
      });
    }
  });
</script>

<svelte:head>
  <title>LivelyChat</title>
  <meta property="og:title" content="LivelyChat" />
  <meta property="og:type" content="website" />
</svelte:head>

<div class="hero bg-base-200 min-h-screen">
  <div class="hero-content text-center">
    <div class="flex max-w-fit flex-col gap-6">
      <h1 class="text-5xl font-bold">LivelyChat</h1>
      <p class="text-xl">Live broadcasts chat messages on the web.</p>
      {#if $overviewQuery.isSuccess}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <i class="fa-solid fa-user-group fa-xl"></i>
            </div>
            <div class="stat-title">Total Chats</div>
            <div class="stat-value text-primary">{$overviewQuery.data.chatCount}</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <i class="fa-solid fa-comments fa-xl"></i>
            </div>
            <div class="stat-title">Total Messages</div>
            <div class="stat-value text-secondary">{$overviewQuery.data.messageCount}</div>
          </div>
        </div>
      {/if}
      <div class="flex gap-3">
        <button
          type="button"
          class="btn btn-primary grow"
          onclick={() => {
            showCollapse = !showCollapse;
          }}
        >
          Get started
          <span class="transition {showCollapse ? '-rotate-180' : 'rotate-0'}">
            <i class="fa-solid fa-angle-down fa-sm"></i>
          </span>
        </button>

        <a
          href={GITHUB_LINK}
          target="_blank"
          class="btn btn-outline gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        >
          View on GitHub
          <i class="fa-brands fa-github fa-xl"></i>
        </a>
      </div>
      <div
        class="bg-base-200 bg-opacity-30 collapse-transition collapse -mt-5 h-0 rounded-xl border backdrop-blur-2xl hover:shadow-sm dark:border-neutral-700 dark:shadow-neutral-700/70"
        class:collapse-open={showCollapse}
        class:min-h-fit={showCollapse}
        class:h-full={showCollapse}
        class:mt-0={showCollapse}
        class:opacity-0={!showCollapse}
      >
        <div
          class="collapse-content flex flex-col items-center gap-4 pt-0 transition-[padding] duration-300"
          class:pt-4={showCollapse}
        >
          <fieldset class="fieldset bg-base-200 rounded-box w-xs p-4 pt-2">
            <span class="label">Address</span>
            <input
              type="text"
              class="input"
              placeholder="platform/identifier"
              bind:value={address}
            />
            <span class="label mt-1">Secret key</span>
            <input type="text" class="input" placeholder="Optional" bind:value={secret} />
            <span class="label mt-1">My identity</span>
            <input type="text" class="input" placeholder="Optional" bind:value={self} />
            <button class="btn btn-outline btn-primary mt-3" disabled={!url} onclick={handleGo}>
              Go
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</div>
