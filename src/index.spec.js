import { describe, it, expect, beforeEach } from 'vitest';
import env from './index';
import { getStorage } from '@cloud-cli/cli';

const app = { app: 'test' };
const appAndKey = { app: 'test', key: 'KEY' };
const envVariable = { app: 'test', key: 'KEY', value: 'ok' };

describe('store KV pairs', () => {
  beforeEach(() => getStorage('env').reset());

  it('should throw errors if parameters are missing', async () => {
    await expect(env.set({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.set({ app: '', name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.set({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));

    await expect(env.get({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.get({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.get({ name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));

    await expect(env.show({ app: '' })).rejects.toEqual(new Error('App not specified'));

    await expect(env.remove({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.remove({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.remove({ app: '', name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
  });

  it('should return null if no value is stored', async () => {
    await expect(env.get({ app: 'test', key: 'key' })).resolves.toEqual(null);
  });

  it('should store key/value pairs', async () => {
    // idempotent
    await expect(env.set(envVariable)).resolves.toEqual(envVariable);
    await expect(env.set(envVariable)).resolves.toEqual(envVariable);
    await expect(env.get(appAndKey)).resolves.toEqual(envVariable);
  });

  it('should list all values stored for an app', async () => {
    await env.set(envVariable);
    await expect(env.apps()).resolves.toEqual(['test']);
    await expect(env.show(app)).resolves.toEqual([envVariable]);
    await expect(env.show({ app: '', name: 'test' })).resolves.toEqual([envVariable]);
  });

  it('should remove stored values for an app', async () => {
    await env.set(envVariable);
    await expect(env.remove(envVariable)).resolves.toBe(true);
    await expect(env.remove(envVariable)).resolves.toBe(false);
    await expect(env.show(app)).resolves.toEqual([]);
  });

  it('should list all entries', async () => {
    const one = { app: 'list', key: 'ONE', value: 'one' };
    const two = { app: 'list', key: 'TWO', value: 'two' };

    await env.set(one);
    await env.set(two);
    await expect(env.list()).resolves.toEqual([one, two]);
    await expect(env.list({ app: 'list' })).resolves.toEqual([one, two]);
    await env.remove(one);
    await env.remove(two);

    await expect(env.list()).resolves.toEqual([]);
  });
});
