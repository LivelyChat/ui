<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { Message } from '$lib/api/messages';
  import { getUrl } from '$lib/utils';
  import moment from 'moment';

  let { message, isSelf, context }: { message: Message; isSelf: boolean; context: Message[] } =
    $props();

  let isSelected = $derived(page.url.hash === `#message-${message.id}`);

  $effect(() => {
    if (isSelected) {
      setTimeout(() => {
        goto(page.url.pathname + page.url.search);
      }, 1000);
    }
  });
</script>

<div
  id="message-{message.id}"
  class="chat {isSelf ? 'message-end' : 'message-start'} {isSelected
    ? 'bg-base-300'
    : 'transition-colors duration-500'} px-8"
>
  <div class="chat-image avatar">
    <div class="w-12 rounded-full">
      <img alt="Avatar" src={getUrl(message.sender.avatar)} />
    </div>
  </div>
  <div class="chat-header items-center text-sm">
    {message.sender.nickname || message.sender.username}
    {#if message.sender.role}
      {@const roleClass =
        message.sender.role.toLowerCase() === 'owner'
          ? 'badge-warning'
          : message.sender.role.toLowerCase() === 'admin'
            ? 'badge-success'
            : ''}
      <div class="badge badge-xs uppercase {roleClass}">
        {message.sender.role}
      </div>
    {/if}
  </div>
  <div class="message">
    {#each message.elements as element}
      {#if element.type === 'text'}
        <div
          class="message-bubble {isSelf
            ? 'chat-bubble-accent'
            : 'chat-bubble-neutral'} text-lg break-all"
        >
          <p class="whitespace-pre-wrap">{element.data.text}</p>
        </div>
      {:else if element.type === 'reply'}
        {@const repliee = context.find((m) => m.id === element.data.id)}
        <button
          class="btn btn-sm h-fit w-fit max-w-full justify-start gap-3 px-5 py-1 text-start font-normal"
          disabled={!repliee}
          onclick={() => {
            goto(`#message-${element.data.id}`);
          }}
        >
          <i class="fa-solid fa-reply"></i>
          <div class="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
            {#if repliee}
              <span class="text-xs opacity-70"
                >{repliee.sender.nickname || repliee.sender.username}</span
              >
              <p class="text-sm">{repliee.content}</p>
            {:else}
              <span class="text-sm font-bold">Out of scope</span>
              <p>ID: {element.data.id}</p>
            {/if}
          </div>
        </button>
      {:else if element.type === 'face'}
        <img
          alt={element.data.summary}
          class="emoji-sm"
          src="https://koishi.js.org/QFace/gif/s{element.data.id}.gif"
        />
      {:else if element.type === 'image'}
        <img
          alt={element.data.summary}
          class="rounded-3xl {element.data.sub_type === 0 ? 'media' : 'emoji'}"
          src={getUrl(element.data.url)}
        />
      {:else}
        <p class="break-all">{JSON.stringify(element)}</p>
      {/if}
    {/each}
  </div>
  <div class="chat-footer opacity-35">
    <time>{moment(message.timestamp * 1000).calendar()}</time>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .media {
    max-width: min(500px, 100%);
    max-height: 500px;
  }

  .emoji {
    max-width: min(150px, 100%);
    max-height: 150px;
  }

  .emoji-sm {
    max-width: min(50px, 100%);
    max-height: 50px;
  }

  .message-start {
    place-items: start;
    grid-template-columns: auto 1fr;
    .chat-header {
      grid-column-start: 2;
    }
    .chat-footer {
      grid-column-start: 2;
    }
    .chat-image {
      grid-column-start: 1;
    }
    .message {
      grid-column-start: 2;
    }
  }

  .message-end {
    place-items: end;
    grid-template-columns: 1fr auto;
    .chat-header {
      grid-column-start: 1;
    }
    .chat-footer {
      grid-column-start: 1;
    }
    .chat-image {
      grid-column-start: 2;
    }
    .message {
      grid-column-start: 1;
      @apply items-end;
    }
  }

  .message {
    position: relative;
    width: fit-content;
    grid-row-end: 3;
    min-height: 2rem /* 32px */;
    min-width: 2.5rem /* 40px */;
    max-width: 90%;
    @apply my-0.5 flex flex-col gap-1;
  }

  .message-bubble {
    position: relative;
    display: block;
    padding-inline: calc(0.25rem /* 4px */ * 4) /* 1rem = 16px */;
    padding-block: calc(0.25rem /* 4px */ * 2) /* 0.5rem = 8px */;
    @apply w-fit rounded-3xl;
  }
</style>
