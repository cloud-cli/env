import env from './index';

beforeAll(() => {
  process.env.IN_MEMORY_DB = true;
});

const app = { app: 'test' };
const envVariable = { app: 'test', key: 'key', value: 'ok' };

describe('env', () => {
  it('should store variables for an app', async () => {
    env.reload();
    await expect(env.set({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.set({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));

    await expect(env.get({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.get({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.get({ app: 'test', key: 'key' })).resolves.toEqual([]);

    // upsert
    await expect(env.set(envVariable)).resolves.toBeNull();
    await expect(env.set(envVariable)).resolves.toBeNull();

    await expect(env.get({ app: 'test', key: 'key' })).resolves.toEqual([envVariable]);

    await expect(env.show({ app: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.show(app)).resolves.toEqual([envVariable]);
    await expect(env.apps()).resolves.toEqual([{ app: 'test' }]);

    await expect(env.remove({ app: '', key: '' })).rejects.toEqual(new Error('App not specified'));
    await expect(env.remove({ app: 'test', key: '' })).rejects.toEqual(new Error('Key not specified'));
    await expect(env.remove(envVariable)).resolves.toBeNull();
    await expect(env.show(app)).resolves.toEqual([]);
  });
});
