import { useAuthStore } from '@/core/stores/auth';
import type { FetchConfig } from '@/core/types/useFetchData';
import { useLogger } from '@/utils/logger';
import { storeToRefs } from 'pinia';

export async function useFetchData(config: FetchConfig): Promise<Response | null> {
  const logger = useLogger('useFetchData');
  const authStore = useAuthStore();
  const { sessionUser } = storeToRefs(authStore);

  const populateHeaders = (headers: Headers) => {
    if (config.contentType) {
      headers.append('Content-Type', config.contentType);
    }
    if (config.requiresAuth && sessionUser.value?.accessToken) {
      headers.append('Authorization', 'Bearer ' + sessionUser.value.accessToken);
    }
  };

  const createRequestOptions = () => {
    const requestOptions: RequestInit = {
      method: config.method,
    };
    if (config.body) {
      requestOptions.body = config.body;
    }
    const headers: Headers = new Headers();
    populateHeaders(headers);
    if ([...headers.keys()].length > 0) {
      requestOptions.headers = headers;
    }
    return requestOptions;
  };

  const requestOptions: RequestInit = createRequestOptions();

  try {
    logger.debug('Fetching data from:', config.url, 'with options:', requestOptions);
    const response = await fetch(config.url, requestOptions);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response;
  } catch (error) {
    logger.error('Error fetching data: ', error);
    return null;
  }
}
