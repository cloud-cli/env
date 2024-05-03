import { getStorage } from '@cloud-cli/cli';

const appNotSpecifiedError = new Error('App not specified');
const keyNotSpecifiedError = new Error('Key not specified');

const { get, set, remove, getAll } = getStorage<EnvEntry>('env');

export class EnvEntry {
  app: string;
  key: string;
  value: string;
}

export interface App {
  app: string;
  name?: string;
}

export interface ListFilters {
  app?: string;
  key?: string;
}

export interface KeyValue {
  key: string;
  value?: string;
}

export interface AppKeyValue extends App, KeyValue {}

async function show(options: App) {
  const app = options.app || options.name;

  if (!app) {
    throw appNotSpecifiedError;
  }

  return list({ app });
}

async function list(filters: ListFilters = {}) {
  let all = await getAll();

  if (filters.app) {
    all = all.filter((e) => e.app === filters.app);
  }

  if (filters.key) {
    all = all.filter((e) => e.key === filters.key);
  }

  return all;
}

async function apps() {
  const rows = await getAll();
  const apps = rows.map((entry) => entry.app);
  return [...new Set(apps)];
}

async function setVar(options: AppKeyValue) {
  const app = options.app || options.name;
  const { key, value } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  const entry = { app, key, value };
  await set(computeId(app, key), entry);

  return entry;
}

async function removeVar(options: AppKeyValue) {
  const app = options.app || options.name;
  const { key } = options;
  const found = await getVar({ app, key });

  if (found) {
    await remove(computeId(app, key));
    return true;
  }

  return false;
}

async function getVar(options: Omit<AppKeyValue, 'value'>) {
  const app = options.app || options.name;
  const { key } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  return get(computeId(app, key));
}

const invalidRe = /[^a-z09-]/g;
function computeId(app, key) {
  return `${app}.${key}`.replace(invalidRe, '-');
}

export default {
  get: getVar,
  set: setVar,
  remove: removeVar,
  show,
  apps,
  list,
};
