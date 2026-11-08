//src/components/__tests/example.test.js
import { test, expect } from 'vitest';
import { useLogger } from '@/utils/logger';
const logger = useLogger('exampleTest');

const sum = (a: number, b: number) => {
  return a + b;
};

test('add 2 numbers', () => {
  expect(sum(2, 3)).toEqual(5);
});

test('add 3 numbers', () => {
  logger.log(
    'summing an array of numbers results in',
    [2, 3, 5].reduce((a, b) => sum(a, b), 0)
  );
  expect([2, 3, 5].reduce((a, b) => sum(a, b), 0)).toEqual(10);
});
