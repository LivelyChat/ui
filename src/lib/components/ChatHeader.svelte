<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getUrl } from '$lib/utils';

  let {
    platform,
    target,
    onlineCount,
    self = $bindable()
  }: {
    platform: string;
    target: { name: string; avatar: string };
    onlineCount: number;
    self: string | undefined;
  } = $props();

  let isHovered = $state(false);
  let copied = $state(false);

  let settingsDialog: HTMLDialogElement;
</script>

<dialog id="settings" class="modal" bind:this={settingsDialog}>
  <fieldset
    class="modal-box fieldset bg-base-200 border-base-300 rounded-box flex flex-col justify-center gap-2 border p-4 duration-100"
  >
    <legend class="fieldset-legend text-lg">My identity</legend>
    <input type="text" class="input w-full" bind:value={self} placeholder="Optional" />
    <p class="label text-wrap">Provide an identity whose messages are displayed on the right.</p>
    <button
      type="button"
      class="btn btn-primary mt-1"
      onclick={() => {
        settingsDialog.close();
        localStorage.setItem(`self.${platform}`.toLowerCase(), self || '');
      }}>Continue</button
    >
  </fieldset>
</dialog>

<nav
  class="navbar-w shadow-base-300/20 border-base-100/20 hover:border-secondary fixed top-4 z-[900] mx-4 flex justify-between gap-4 overflow-hidden rounded-full border-2 bg-white/35 p-4 shadow-sm backdrop-blur-3xl backdrop-brightness-85 transition-all hover:bg-white/60 dark:bg-transparent dark:backdrop-brightness-65 hover:dark:bg-transparent hover:dark:backdrop-brightness-30"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <div class="navbar-start">
    <div class="avatar">
      <div
        class="{isHovered
          ? 'w-12 sm:w-20 md:w-24 lg:w-32 xl:w-40'
          : 'w-9'} rounded-full transition-all"
      >
        <img alt="Avatar" src={getUrl(target.avatar)} />
      </div>
    </div>
  </div>
  <div class="navbar-center flex-col items-center justify-center">
    <div
      class="{isHovered
        ? 'text-xl md:text-2xl lg:text-3xl xl:text-4xl'
        : 'text-lg sm:text-xl lg:text-2xl'} font-bold transition-all"
    >
      {target.name}
    </div>
    <div
      class="flex items-end gap-1 overflow-hidden {isHovered
        ? 'h-7 sm:h-9 md:h-10 lg:h-12'
        : 'h-0'} transition-all"
    >
      <button
        class="btn btn-xs sm:btn-sm lg:btn-md btn-circle {copied
          ? 'btn-success btn-active'
          : 'btn-ghost'}"
        onclick={() => {
          navigator.clipboard.writeText(page.url.toString());
          copied = true;
          setTimeout(() => {
            copied = false;
          }, 2000);
        }}
      >
        {#if !copied}
          <i class="fa-solid fa-copy fa-xl"></i>
        {:else}
          <span>
            <i class="fa-solid fa-check fa-xl"></i>
          </span>
        {/if}
      </button>
      <button
        class="btn btn-xs sm:btn-sm lg:btn-md btn-circle btn-ghost"
        aria-label="Settings"
        onclick={() => {
          settingsDialog.showModal();
        }}
        ><i class="fa-solid fa-gear fa-xl"></i>
      </button>
      <button
        class="btn btn-xs sm:btn-sm lg:btn-md btn-circle btn-ghost"
        aria-label="Back to home"
        onclick={() => {
          goto('/');
        }}
        ><i class="fa-solid fa-right-from-bracket fa-xl"></i>
      </button>
    </div>
  </div>
  <div
    class="navbar-end flex-col items-end-safe justify-center {isHovered
      ? 'text-lg md:text-xl lg:text-2xl xl:text-3xl'
      : 'text-base sm:text-lg lg:text-xl'}"
  >
    <div class="flex items-center gap-2">
      <div class="inline-grid *:[grid-area:1/1]">
        <div
          class="{isHovered
            ? 'status-md sm:status-lg md:status-xl'
            : 'md:status-md'} status status-success animate-ping transition-all"
        ></div>
        <div
          class="{isHovered
            ? 'status-md sm:status-lg md:status-xl'
            : 'md:status-md'} status status-success transition-all"
        ></div>
      </div>
      <span class="transition-all">
        {onlineCount}
      </span>
    </div>
    {#if 'memberCount' in target}
      <div
        class="flex items-end overflow-hidden {isHovered
          ? 'h-6 sm:h-7 md:h-8 lg:h-10'
          : 'h-0'} transition-all"
      >
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user-group"></i>
          <span class="transition-all">
            {target.memberCount}
          </span>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  .navbar-w {
    width: calc(100% - 2rem);
  }
</style>
