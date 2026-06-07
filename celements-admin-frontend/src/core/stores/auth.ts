import type { AuthState } from '@/core/types/auth';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    return {
      sessionUser: null,
    };
  },
});
