import '@/assets/main.css';
import 'vuefinder/dist/style.css';

import App from '@/App.vue';
import { createAdminRouter } from '@/plugins/plugin.router';
import {
  createCelementsApplication,
  type CelementsApplicationOptions,
} from '@/runtime/application';

export type CelementsAdminMountOptions = CelementsApplicationOptions;

export function createCelementsAdminApp(options: CelementsAdminMountOptions = {}) {
  return createCelementsApplication(App, {}, { ...options, router: createAdminRouter() });
}
