<script lang="ts">
  import type { Message } from '$lib/api/messages';
  import { createQuery } from '@tanstack/svelte-query';
  import { untrack } from 'svelte';
  import { io } from 'socket.io-client';
  import { MESSAGE_COUNT_PER_REQUEST } from '$lib/constants.js';
  import { tick } from 'svelte';
  import MessageComponent from '$lib/components/Message.svelte';
  import { getPlatformName, preprocess } from '$lib/utils';
  import ChatHeader from '$lib/components/ChatHeader.svelte';
  import { PUBLIC_SOCKET_URL } from '$env/static/public';
  import { page } from '$app/state';
  import { browser } from '$app/environment';

  const limit = MESSAGE_COUNT_PER_REQUEST;
  const SCROLL_THRESHOLD = 500;

  let { data } = $props();
  let { api, platform, chat } = $derived(data);

  let before: number | undefined = $state(undefined);
  let secretFieldset: boolean = $state(false);
  let secretInput: string = $state('');
  let messageCount: number = $state(0);
  let onlineCount: number = $state(0);
  let unreadMessages: string[] = $state([]);
  let chatHistory: Message[] = $state([]);
  let isAtBottom = $state(true);

  let previousScrollHeight: number = 0;
  let previousScrollTop: number = 0;

  let chatContainer: HTMLElement;

  let self = $derived.by(() => {
    const key = `self.${platform}`;
    return (
      page.url.searchParams.get(key) ??
      (browser ? (localStorage.getItem(key.toLowerCase()) ?? undefined) : undefined)
    );
  });
  let secret = $derived(
    browser ? (localStorage.getItem(`secret.${platform}.${chat}`.toLowerCase()) ?? undefined) : undefined
  );

  let groupQuery = $derived(
    browser
      ? createQuery(
          api.qq.groupInfo(
            { platform, chatId: chat, secret },
            { enabled: platform === 'qq' && !chat.startsWith('private:') }
          )
        )
      : undefined
  );
  let messagesQuery = $derived(
    browser ? createQuery(api.messages.list({ platform, chat, secret, before, limit })) : undefined
  );

  const enterSecretKey = () => {
    secret = secretInput.trim();
    secretFieldset = false;
    secretInput = '';
  };

  const checkIfAtBottom = (): boolean => {
    if (!chatContainer) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    return scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD;
  };

  const scrollToBottom = (smooth: boolean = true) => {
    chatContainer?.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    unreadMessages = unreadMessages.filter((id) => !isVisible(id));
  };

  const isVisible = (id: string) => {
    if (!chatContainer) return false;
    const messageElement = document.getElementById(`message-${id}`);
    if (!messageElement) return false;
    const { top, bottom } = messageElement.getBoundingClientRect();
    const { top: containerTop, bottom: containerBottom } = chatContainer.getBoundingClientRect();
    return top >= containerTop && bottom <= containerBottom;
  };

  const loadHistory = () => {
    if (
      chatContainer &&
      chatHistory.length > 0 &&
      chatContainer.scrollTop === 0 &&
      messageCount >= limit &&
      !$messagesQuery?.isFetching
    ) {
      previousScrollHeight = chatContainer.scrollHeight;
      previousScrollTop = chatContainer.scrollTop;
      before = chatHistory[0].timestamp;
    }
  };

  const configureSocket = (platform: string, chat: string, secret?: string) => {
    const socket = io(PUBLIC_SOCKET_URL);

    socket.on('connect', () => {
      socket.emit('join', platform, chat, secret);
    });

    socket.on('joined', (id: string, online: number) => {
      onlineCount = online;
      console.log(`Joined: ${id}`, online);
      if (id === socket.id && secret) {
        localStorage.setItem(`secret.${platform}.${chat}`.toLowerCase(), secret);
      }
    });

    socket.on('left', (id: string, online: number) => {
      onlineCount = online;
      console.log(`Left: ${id}`, online);
    });

    socket.on('message', async (message: Message) => {
      console.log('New message received:', message);
      chatHistory.push(message);
      if (isAtBottom) {
        await tick();
        scrollToBottom(true);
      } else {
        unreadMessages.push(message.id);
      }
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return socket;
  };

  $effect(() => {
    if (chatContainer && $messagesQuery?.isSuccess && !$messagesQuery.isFetching) {
      untrack(async () => {
        console.log('History loaded:', $messagesQuery.data);

        const isInitialLoad = chatHistory.length === 0 && previousScrollHeight === 0;
        const newFetchedMessages = $messagesQuery.data.messages.toReversed();

        if (newFetchedMessages.length > 0) {
          chatHistory = [...newFetchedMessages, ...chatHistory];
          messageCount = $messagesQuery.data.total;

          await tick();

          if (!isInitialLoad) {
            const newCurrentScrollHeight = chatContainer.scrollHeight;
            const heightAdded = newCurrentScrollHeight - previousScrollHeight;
            chatContainer.scrollTop = previousScrollTop + heightAdded;
          } else {
            scrollToBottom(false);
            loadHistory();
          }
        }
      });
    }
    if ($messagesQuery?.isError) {
      if ($messagesQuery.error.httpStatus === 403) {
        secretFieldset = true;
      }
    }
  });

  $effect(() => {
    if (!$messagesQuery?.isSuccess) return;

    const socket = configureSocket(platform, chat, secret);
    socket.connect();

    return () => {
      socket.disconnect();
    };
  });
</script>

<svelte:head>
  <title>
    {$groupQuery?.data?.name || chatHistory.at(0)?.sender.username || chat} - LivelyChat {getPlatformName(
      platform
    )}
  </title>
  <meta property="og:title" content="{chat} - LivelyChat {getPlatformName(platform)}" />
  <meta property="og:type" content="website" />
</svelte:head>

{#if $groupQuery?.isSuccess}
  <ChatHeader target={$groupQuery.data} {platform} {onlineCount} bind:self />
{:else if chat.startsWith('private:') && chatHistory.length > 0}
  {@const target = chatHistory[0].sender}
  <ChatHeader
    target={{ name: target.username, avatar: target.avatar }}
    {platform}
    {onlineCount}
    bind:self
  />
{/if}

<div class="flex h-screen w-screen flex-col items-center justify-center">
  {#if unreadMessages.length > 0}
    <button
      class="btn btn-soft btn-primary absolute right-10 bottom-6 z-90 gap-2"
      onclick={() => {
        scrollToBottom(true);
      }}
    >
      <i class="fa-solid fa-chevron-down"></i>
      {unreadMessages.length}
    </button>
  {/if}
  {#if $messagesQuery?.isLoading && chatHistory.length === 0}
    <span class="loading loading-spinner w-16"></span>
  {/if}
  {#if secretFieldset}
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box flex flex-col justify-center gap-2 border p-4"
    >
      <legend class="fieldset-legend text-lg">Secret key</legend>
      <input
        type="text"
        class="input w-full"
        bind:value={secretInput}
        placeholder="Enter the secret key here"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            enterSecretKey();
          }
        }}
      />
      <p class="label text-wrap">Please provide the secret key in order to access this chat.</p>
      <button class="btn btn-primary" onclick={enterSecretKey}>Continue</button>
    </fieldset>
  {/if}
  <div
    bind:this={chatContainer}
    class="o flex max-h-screen w-full scroll-pt-24 flex-col overflow-y-auto pt-24 pb-4"
    onscroll={() => {
      loadHistory();
      isAtBottom = checkIfAtBottom();
      unreadMessages = unreadMessages.filter((id) => !isVisible(id));
    }}
  >
    {#if messageCount > limit}
      <div class="flex justify-center py-2">
        <span class="loading loading-spinner loading-xl"></span>
      </div>
    {/if}
    {#key chatHistory}
      {@const messages = chatHistory.map((m) => preprocess(m, chatHistory))}
      {#each messages as message (message.id)}
        <MessageComponent {message} isSelf={self === message.sender.id} context={messages} />
      {/each}
    {/key}
  </div>
</div>

<style>
  .o {
    scroll-behavior: auto; /* Crucial: Disables smooth scroll for instant adjustments */
    -webkit-overflow-scrolling: touch; /* Improves scrolling performance on iOS */
  }
</style>
