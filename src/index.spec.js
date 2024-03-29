import env, { EnvEntry } from './index';
import { init } from '@cloud-cli/cli';
import { Resource, SQLiteDriver } from '@cloud-cli/store';

const app = { app: 'test' };
const envVariable = { app: 'test', key: 'key', value: 'ok' };

describe('env', () => {
  it('should initialize the module', async () => {
    const useMock = jest.spyOn(Resource, 'use').mockReturnValue(null);
    const createMock = jest.spyOn(Resource, 'create').mockReturnValue(null);
    await env[init]();

    expect(Resource.use).toHaveBeenCalled();
    expect(Resource.create).toHaveBeenCalledWith(EnvEntry);
    useMock.mockRestore();
    createMock.mockRestore();
  });

  it('should store variables for an app', async () => {
    Resource.use(new SQLiteDriver(':memory:'));
    await Resource.create(EnvEntry);

    await expect(env.set({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.set({ app: '', name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.set({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));

    await expect(env.get({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.get({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.get({ name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.get({ app: 'test', key: 'key' })).resolves.toEqual([]);

    // upsert
    await expect(env.set(envVariable)).resolves.toEqual(envVariable);
    await expect(env.set(envVariable)).resolves.toEqual(envVariable);

    await expect(env.get({ app: 'test', key: 'key' })).resolves.toEqual([{ ...envVariable, id: 2 }]);

    await expect(env.show({ app: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.show(app)).resolves.toEqual([{ ...envVariable, id: 2 }]);
    await expect(env.show({ app: '', name: 'test' })).resolves.toEqual([{ ...envVariable, id: 2 }]);
    await expect(env.apps()).resolves.toEqual(['test']);

    await expect(env.remove({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.remove({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.remove({ app: '', name: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.remove(envVariable)).resolves.toBeUndefined();
    await expect(env.show(app)).resolves.toEqual([]);
  });
});
