import type { Maybe } from '@/utils/utils';
import { DateTime } from 'luxon';

const dateSerializer = (value: unknown) => {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toISODate();
  }
  return value;
};

const convertToDate = (value: Maybe<string>) => {
  return value ? new Date(value) : null;
};

export { convertToDate, dateSerializer };
