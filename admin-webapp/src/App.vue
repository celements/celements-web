<template>
  <Suspense>
    <div>
      <TheHeader class="sticky top-0 z-20" />
      <main
        :class="[
          {
            [`min-h-[calc(100vh-theme('spacing.20')-644px)] md:min-h-[calc(100vh-theme('spacing.32')-356px)]`]:
              sessionUser,
          },
          {
            [`min-h-[calc(100vh-theme('spacing.20')-276px)] md:min-h-[calc(100vh-theme('spacing.28')-136px)]`]:
              !sessionUser,
          },
        ]"
      >
        <Toast position="top-center" :pt="toastPT" />
        <PageSection v-if="sessionUser && !sessionUserProfile">
          <div class="flex items-center">
            <ProgressSpinner />
          </div>
        </PageSection>
        <RegistrationView
          v-else-if="
            sessionUser &&
            !sessionUser.isAdmin &&
            sessionUserProfile &&
            !sessionUserProfile.profileCompleted
          "
        />
        <RouterView v-else />
      </main>
      <TheFooter />
    </div>
  </Suspense>
</template>

<script setup lang="ts">
import PageSection from '@/components/base/PageSection.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheHeader from '@/components/TheHeader.vue';
import { useAuthStore } from '@/core/stores/auth';
import { useProfileStore } from '@/core/stores/profile';
import RegistrationView from '@/views/RegistrationView.vue';
import { storeToRefs } from 'pinia';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
const { sessionUser } = storeToRefs(authStore);
const { sessionUserProfile } = storeToRefs(useProfileStore());

const toastPT = {
  summary: {
    class: 'font-futuraMedium text-lg',
  },
  detail: {
    class: 'font-futuraBook text-base text-schwarz-100',
  },
};
</script>

<style>
#app img {
  overflow-clip-margin: unset; /* makes images on Chrome crisper and less pixelated https://stackoverflow.com/questions/74502978/object-fit-cover-gives-pixelated-images-on-chrome */
}
</style>
