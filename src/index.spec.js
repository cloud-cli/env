import { describe, it, expect, beforeEach } from 'vitest';
import env from './index';
import { getStorage } from '@cloud-cli/cli';

const app = { app: 'test' };
const appAndKey = { app: 'test', key: 'KEY' };
const envVariable = { app: 'test', key: 'KEY', value: 'ok' };

describe('store KV pairs', () => {
  beforeEach(() => getStorage('env').reset());

  it('should throw errors if parameters are missing', async () => {
    expect(() => env.set({ app: '', key: '' })).toThrow(new Error('App not specified'));
    expect(() => env.set({ app: '', name: 'test', key: '' })).toThrow(new Error('Key not specified'));
    expect(() => env.set({ app: 'test', key: '' })).toThrow(new Error('Key not specified'));

    expect(() => env.get({ app: '', key: '' })).toThrow(new Error('App not specified'));
    expect(() => env.get({ app: 'test', key: '' })).toThrow(new Error('Key not specified'));
    expect(() => env.get({ name: 'test', key: '' })).toThrow(new Error('Key not specified'));

    expect(() => env.show({ app: '' })).toThrow(new Error('App not specified'));

    expect(() => env.remove({ app: '', key: '' })).toThrow(new Error('App not specified'));
    expect(() => env.remove({ app: 'test', key: '' })).toThrow(new Error('Key not specified'));
    expect(() => env.remove({ app: '', name: 'test', key: '' })).toThrow(new Error('Key not specified'));
  });

  it('should return null if no value is stored', async () => {
    expect(env.get({ app: 'test', key: 'key' })).toEqual(null);
  });

  it('should store key/value pairs', async () => {
    // idempotent
    expect(env.set(envVariable)).toEqual(envVariable);
    expect(env.set(envVariable)).toEqual(envVariable);
    expect(env.get(appAndKey)).toEqual(envVariable);
    expect(env.list()).toEqual([envVariable])
  });

  it('should list all values stored for an app', async () => {
    env.set(envVariable);
    expect(env.apps()).toEqual(['test']);
    expect(env.show(app)).toEqual([envVariable]);
    expect(env.show({ app: '', name: 'test' })).toEqual([envVariable]);
  });

  it('should remove stored values for an app', async () => {
    env.set(envVariable);
    expect(env.remove(envVariable)).toBe(true);
    expect(env.remove(envVariable)).toBe(false);
    expect(env.show(app)).toEqual([]);
  });

  it('should list all entries', async () => {
    const one = { app: 'list', key: 'ONE', value: 'one' };
    const two = { app: 'list', key: 'TWO', value: 'two' };

    env.set(one);
    env.set(two);
    expect(env.list()).toEqual([one, two]);
    expect(env.list({ app: 'list' })).toEqual([one, two]);
    env.remove(one);
    env.remove(two);

    expect(env.list()).toEqual([]);
  });
});
