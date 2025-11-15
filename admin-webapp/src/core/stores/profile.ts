import { useFetchData } from '@/composables/fetchData';
import { useAuthStore } from '@/core/stores/auth';
import type { ApiData, PersonData } from '@/core/types/profile';
import type { FetchConfig, RequestMethod } from '@/core/types/useFetchData';
import { convertToDate, dateSerializer } from '@/utils/dateutils';
import { useLogger } from '@/utils/logger';
import type { Maybe } from '@/utils/utils';
import { mapValues } from 'lodash';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export const useProfileStore = defineStore('profile', () => {
  const logger = useLogger('profileStore');
  const { locale, availableLocales } = useI18n();
  const route = useRoute();

  const editProfile = ref(false);

  const defaultCommunicationLanguage = computed<Maybe<string>>(() => {
    const browserLanguage = window.navigator.language.split('-')[0];
    const availableCommunicationLanguages = ['de', 'fr', 'it', 'en'];
    if (availableCommunicationLanguages.includes(browserLanguage)) {
      return browserLanguage;
    } else {
      return null;
    }
  });

  const defaultPerson: PersonData = Object.freeze({
    id: '',
    profileCompleted: null,
    salutation: '',
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    sex: null,
    communicationLanguage: defaultCommunicationLanguage.value,
    emailPrivate: '',
    emailBusiness: '',
    phone: '',
    linkedInUrl: '',
    webseiteUrl: '',
    street: '',
    streetNumber: '',
    zip: '',
    city: '',
    entryDate: null,
    exitDate: null,
    currentEmployer: '',
    currentJobTitle: '',
    currentSector: '',
    uni: '',
    subject: '',
    uniDegreeYear: '',
    subjectInterests: '',
    dataProtectionTermsAccepted: false,
    tags: {
      duties: null,
      helvetialevel: null,
      lastsite: null,
      titledegree: null,
    },
    newsletterSubscribed: true,
    registrationComments: '',
  });
  const sessionUserProfile = ref<Maybe<PersonData>>();

  const personFullName = computed<string>(() =>
    sessionUserProfile.value
      ? `${sessionUserProfile.value.firstName} ${sessionUserProfile.value.lastName}`.trim()
      : ''
  );

  const userLanguage = computed<string>(() => {
    let fallBackLanguage: string = import.meta.env.VITE_DEFAULT_LOCALE;
    const browserLanguage = window.navigator.language.split('-')[0];
    if (availableLocales.includes(browserLanguage)) {
      fallBackLanguage = browserLanguage;
    }
    if (route?.query.language && availableLocales.includes(route.query.language as string)) {
      fallBackLanguage = route.query.language as string;
    }
    return sessionUserProfile.value?.communicationLanguage ?? fallBackLanguage;
  });
  locale.value = userLanguage.value;
  watch(userLanguage, (newValue) => {
    if (availableLocales.includes(newValue)) {
      locale.value = newValue;
    }
  });

  const authStore = useAuthStore();
  const { sessionUser } = storeToRefs(authStore);
  const userEmail = computed<string>(() => {
    return sessionUser.value?.email ?? '';
  });
  watchEffect(async () => {
    if (userEmail.value) {
      logger.debug('loggedin User email: ', userEmail.value);
      sessionUserProfile.value = await fetchInitialData(`/personByEmail/${userEmail.value}`);
    }
  });

  const baseUrl = import.meta.env.VITE_PROGON_API_URL;
  const CONTENT_TYPE_JSON = 'application/json';

  const fetchInitialData = async (path: string): Promise<Maybe<PersonData>> => {
    logger.debug('Fetching initial data');
    const url = new URL(`api/persons${path}`, baseUrl);
    const fetchConfig: FetchConfig = {
      url: url,
      method: 'GET' as RequestMethod,
      requiresAuth: true,
    };
    const response = await useFetchData(fetchConfig);
    if (response) {
      const initialData = await response.json();
      const personData = updateData(initialData);
      logger.debug('Initial data fetched: ', JSON.stringify(personData));
      return personData;
    }
    return undefined;
  };

  const updatePersonData = async (personData: PersonData): Promise<boolean> => {
    logger.debug('update person data');
    try {
      const url = new URL(`api/persons/person/${personData.id}?returnPerson=true`, baseUrl);
      // We do not need time or timezone information. Both will lead to wrong dates. (Browser local time converted to UTC...)
      const serializedData = mapValues(personData, dateSerializer);
      logger.debug('Form submitted: ', JSON.stringify(serializedData));
      const fetchConfig: FetchConfig = {
        url: url,
        method: 'PUT' as RequestMethod,
        requiresAuth: true,
        contentType: CONTENT_TYPE_JSON,
        body: JSON.stringify(serializedData),
      };
      const response = await useFetchData(fetchConfig);
      if (response) {
        const responseContent = await response.json();
        if (!responseContent.successfull) {
          throw new Error(`Response content: ${JSON.stringify(responseContent)}`);
        }
        const savedData = responseContent.person;
        sessionUserProfile.value = updateData(savedData);
        logger.debug('Data saved successfully');
        return true;
      }
    } catch (error) {
      logger.error('Error saving data: ', error);
    }
    return false;
  };

  const createNewPerson = async (personData: PersonData) => {
    logger.debug('create new person');
    try {
      const url = new URL(`api/persons/personWithNotificationEmail`, baseUrl);
      // We do not need time or timezone information. Both will lead to wrong dates. (Browser local time converted to UTC...)
      const serializedData = mapValues(personData, dateSerializer);
      logger.debug('Form submitted: ', JSON.stringify(serializedData));
      const fetchConfig: FetchConfig = {
        url: url,
        method: 'POST' as RequestMethod,
        contentType: CONTENT_TYPE_JSON,
        body: JSON.stringify(serializedData),
      };
      const response = await useFetchData(fetchConfig);
      if (response) {
        const responseContent = await response.json();
        if (!responseContent.successfull) {
          throw new Error(`Response content: ${JSON.stringify(responseContent)}`);
        }
        logger.debug('Data saved successfully');
        return true;
      }
    } catch (error) {
      logger.error('Error saving data: ', error);
    }
    return false;
  };

  const updatePersonWithActivate = async (personData: PersonData) => {
    logger.debug('update person data and activate');
    try {
      const url = new URL(
        `api/persons/personWithActivate/${personData.id}?returnPerson=true`,
        baseUrl
      );
      // We do not need time or timezone information. Both will lead to wrong dates. (Browser local time converted to UTC...)
      const serializedData = mapValues(personData, dateSerializer);
      logger.debug('Form submitted: ', JSON.stringify(serializedData));
      const fetchConfig: FetchConfig = {
        url: url,
        method: 'PUT' as RequestMethod,
        requiresAuth: true,
        contentType: CONTENT_TYPE_JSON,
        body: JSON.stringify(serializedData),
      };
      const response = await useFetchData(fetchConfig);
      if (response) {
        const responseContent = await response.json();
        if (!responseContent.successfull) {
          throw new Error(`Response content: ${JSON.stringify(responseContent)}`);
        }
        const newData = responseContent.person;
        sessionUserProfile.value = updateData(newData);
        logger.debug('Data saved successfully');
        return true;
      }
    } catch (error) {
      logger.error('Error saving data: ', error);
    }
    return false;
  };

  const deletePerson = async (personData: PersonData) => {
    logger.debug('Deleting person: ', personData.id);
    try {
      const url = new URL(`api/persons/delete/${personData.id}`, baseUrl);
      const fetchConfig: FetchConfig = {
        url: url,
        method: 'DELETE' as RequestMethod,
        requiresAuth: true,
      };
      const response = await useFetchData(fetchConfig);
      if (response) {
        const responseContent = await response.json();
        if (!responseContent.successfull) {
          throw new Error(`Response content: ${JSON.stringify(responseContent)}`);
        }
        logger.debug('Person deleted successfully');
        return true;
      }
    } catch (error) {
      logger.error('Error deleting person: ', error);
    }
    return false;
  };

  const sendActivationLink = async (orgId: string | string[]) => {
    try {
      const url = new URL(`api/persons/sendResetPasswordEmail/${orgId}`, baseUrl);
      logger.debug('call fetch for sendActivationLink: ', url);
      const fetchConfig: FetchConfig = {
        url: url,
        method: 'PATCH' as RequestMethod,
        contentType: CONTENT_TYPE_JSON,
      };
      const response = await useFetchData(fetchConfig);
      if (response) {
        const data = await response.json();
        if (!data.successful) {
          throw new Error(`Response content: ${JSON.stringify(data)}`);
        }
        return true;
      }
    } catch (error) {
      logger.error('Error while sending activation link: ', error);
    }
    return false;
  };

  const updateData = (newData: ApiData): PersonData => {
    const personData: PersonData = {
      ...defaultPerson,
      ...newData,
      tags: {
        ...defaultPerson.tags,
        ...newData.tags,
      },
      dateOfBirth: convertToDate(newData?.dateOfBirth),
      entryDate: convertToDate(newData?.entryDate),
      exitDate: convertToDate(newData?.exitDate),
    };
    return personData;
  };

  return {
    defaultPerson,
    userEmail,
    editProfile,
    sessionUserProfile,
    personFullName,
    fetchInitialData,
    updatePersonData,
    createNewPerson,
    updatePersonWithActivate,
    deletePerson,
    sendActivationLink,
  };
});
