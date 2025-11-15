//Source: https://dev.to/kouts/a-simple-vue-form-validation-composable-with-zod-38m8

// Import necessary libraries
import { type ZodTypeAny, z } from 'zod';
// We use `get` and `groupBy` from `lodash` for brevity
import { get, groupBy } from 'lodash';
import { ref, watch, toValue, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';

export default function <
  T extends ZodTypeAny,
  U = Record<string, unknown>,
  V = Record<string, z.ZodIssue[]>,
>(schema: T, data: MaybeRefOrGetter<U>, options?: { mode: 'eager' | 'lazy' }) {
  // Merge default options with user-defined options
  const opts = Object.assign({}, { mode: 'lazy' }, options);

  // Reactive variables to track form validity and errors
  const isValid = ref(true);
  const errors = ref<V | null>(null);

  // Function to clear errors
  const clearErrors = () => {
    errors.value = null;
  };

  // Function to initiate validation watch
  let unwatch: null | (() => void) = null;
  const validationWatch = () => {
    if (unwatch !== null) {
      return;
    }

    unwatch = watch(
      () => toValue(data),
      async () => {
        await validate();
      },
      { deep: true }
    );
  };

  // Function to perform validation
  const validate = async () => {
    clearErrors();

    // Validate the form data using Zod schema
    const result = await schema.safeParseAsync(toValue(data));

    // Update validity and errors based on validation result
    isValid.value = result.success;

    if (!result.success) {
      errors.value = groupBy(result.error.issues, 'path');
      validationWatch();
    }

    return errors;
  };

  // Function to scroll to the first error in the form
  const scrolltoError = (selector = '.is-error', options = { offset: 0 }) => {
    const element = document.querySelector(selector);

    if (element) {
      const topOffset =
        element.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        options.offset;

      window.scrollTo({
        behavior: 'smooth',
        top: topOffset,
      });
    }
  };

  // Function to get the error message for a specific form field, can be used to get errors for nested objects using dot notation path.
  const getError = (path: string) =>
    get(errors.value, `${path.replace(new RegExp('\\.', 'g'), ',')}.0.message`);

  // Activate validation watch based on the chosen mode
  if (opts.mode === 'eager') {
    validationWatch();
  }

  // Custom error map for Zod validation (https://zod.dev/ERROR_HANDLING?id=customizing-errors-with-zoderrormap)
  const { t } = useI18n();
  const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
      if (issue.expected === 'string') {
        return { message: t('forms.required') };
      }
      if (issue.expected === 'date') {
        return { message: t('forms.invalid_dateformat') };
      }
      if (issue.expected === 'boolean') {
        return { message: t('forms.invalid_privacyagreement') };
      }
    }
    if (issue.code === z.ZodIssueCode.too_small) {
      if (issue.type === 'string') {
        return { message: t('forms.required') };
      }
    }
    if (issue.code === z.ZodIssueCode.invalid_string) {
      if (issue.validation === 'email') {
        return { message: t('forms.invalid_email') };
      }
    }
    if (issue.code === z.ZodIssueCode.too_big) {
      if (issue.type === 'date') {
        return { message: t('forms.future_date') };
      }
    }
    if (issue.code === z.ZodIssueCode.custom) {
      return { message: t('forms.invalid_privacyagreement') };
    }
    return { message: ctx.defaultError };
  };
  z.setErrorMap(customErrorMap);

  // Expose functions and variables for external use
  return { validate, errors, isValid, clearErrors, getError, scrolltoError };
}
