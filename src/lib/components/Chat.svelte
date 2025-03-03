<!-- Chat.svelte -->
<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { getChatResponse } from '$lib/utils/gemini';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import '$lib/styles/scrollbar.css';

  let inputValue = '';
  let chatContainer: HTMLDivElement;
  let inputContainer: HTMLDivElement;
  let chatWrapper: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (chatWrapper && !chatWrapper.contains(event.target as Node)) {
      chatStore.toggleChat();
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  // Auto scroll to bottom when new messages arrive
  let isUserScrolling = false;

function handleScroll() {
  const threshold = 50;
  const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + threshold;

  isUserScrolling = !isAtBottom;
}

onMount(() => {
  chatContainer.addEventListener("scroll", handleScroll);
  return () => chatContainer.removeEventListener("scroll", handleScroll);
});

$: if ($chatStore.messages.length && chatContainer && !isUserScrolling) {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}


  async function handleSubmit() {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user' as const, text: inputValue };
    chatStore.addMessage(userMessage);
    chatStore.setLoading(true);
    inputValue = '';

    try {
      const response = await getChatResponse(userMessage.text, $chatStore.messages);
      if (response.success) {
        chatStore.addMessage({ role: 'model', text: response.text });
      } else {
        chatStore.addMessage({ 
          role: 'model', 
          text: 'Sorry, I encountered an error. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      chatStore.addMessage({ 
        role: 'model', 
        text: 'Sorry, I encountered an error. Please try again.' 
      });
    } finally {
      chatStore.setLoading(false);
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
</script>

{#if $chatStore.isOpen}
  <div
    bind:this={chatWrapper}
    class="fixed bottom-4 right-4 z-50 flex w-96 flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800"
    transition:fly={{ y: 20, duration: 300, easing: quintOut }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between rounded-t-lg bg-primary p-4 text-white">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <span class="font-medium">Local-First Chat</span>
      </div>
      <button
        on:click={() => chatStore.toggleChat()}
        class="rounded p-1 hover:bg-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div
      bind:this={chatContainer}
      class="custom-scrollbar flex flex-col gap-4 overflow-y-auto p-4"
      style="height: 400px;"
    >
      {#each $chatStore.messages as message (message.timestamp)}
        <div
          class="flex flex-col gap-1"
          transition:slide={{ duration: 300 }}
        >
          <div class="flex items-start gap-2">
            <!-- Avatar -->
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              {#if message.role === 'model'}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              {/if}
            </div>

            <!-- Message content -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium">
                  {message.role === 'model' ? 'AI Assistant' : 'You'}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div 
                class="prose prose-sm mt-1 max-w-none dark:prose-invert"
                class:whitespace-pre-wrap={message.role === 'user'}
              >
                {#if message.role === 'model'}
                  {@html marked(message.text)}
                {:else}
                  {message.text}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if $chatStore.isLoading}
        <div class="flex items-center gap-2" transition:fade>
          <div class="flex gap-1">
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 0ms" />
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 150ms" />
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 300ms" />
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400">AI is typing...</span>
        </div>
      {/if}
    </div>

    <!-- Input -->
    <div
      bind:this={inputContainer}
      class="border-t border-gray-200 p-4 dark:border-gray-700"
    >
      <form
        on:submit|preventDefault={handleSubmit}
        class="flex items-center gap-2"
      >
        <input
          type="text"
          bind:value={inputValue}
          placeholder="Ask about local-first development..."
          class="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
        />
        <button
          type="submit"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50"
          disabled={$chatStore.isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Chat toggle button -->
<button
  on:click={() => chatStore.toggleChat()}
  class="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90"
  class:hidden={$chatStore.isOpen}
  transition:fade
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
  </svg>
</button> 