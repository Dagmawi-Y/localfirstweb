import { writable } from 'svelte/store';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>({
    messages: [],
    isOpen: false,
    isLoading: false
  });

  return {
    subscribe,
    addMessage: (message: Omit<ChatMessage, 'timestamp'>) => 
      update(state => ({
        ...state,
        messages: [...state.messages, { ...message, timestamp: Date.now() }]
      })),
    setLoading: (isLoading: boolean) => 
      update(state => ({ ...state, isLoading })),
    toggleChat: () => 
      update(state => ({ ...state, isOpen: !state.isOpen })),
    reset: () => 
      set({ messages: [], isOpen: false, isLoading: false })
  };
}

export const chatStore = createChatStore(); 