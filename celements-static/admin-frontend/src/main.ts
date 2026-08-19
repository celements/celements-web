import { createCelementsAdminApp } from '@/bootstrap';

const el = document.getElementById('app');
const options = {};
if (el) {
  createCelementsAdminApp(options).mount(el);
}
