import { getStorage } from '@cloud-cli/cli';

const appNotSpecifiedError = new Error('App not specified');
const keyNotSpecifiedError = new Error('Key not specified');

const { get, set, remove, getAll } = getStorage<EnvEntry>('env');

const readName = (options) => {
  options.app = options.app || options.name || options._?.[0];
};

export interface EnvEntry {
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

function show(options: App) {
  readName(options);
  const { app } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  return list({ app });
}

function list(filters: ListFilters = {}) {
  let all = getAll();

  if (filters.app) {
    all = all.filter((e) => e.app === filters.app);
  }

  if (filters.key) {
    all = all.filter((e) => e.key === filters.key);
  }

  return all;
}

function apps() {
  const rows = getAll();
  const apps = rows.map((entry) => entry.app);

  return [...new Set(apps)];
}

function setVar(options: AppKeyValue) {
  readName(options);
  const { key, value, app } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  const entry = { app, key, value };
  set(computeId(app, key), entry);

  return entry;
}

function removeVar(options: AppKeyValue) {
  readName(options);
  const { app, key } = options;
  const found = getVar({ app, key });

  if (found) {
    remove(computeId(app, key));
    return true;
  }

  return false;
}

function getVar(options: Omit<AppKeyValue, 'value'>) {
  readName(options);
  const { app, key } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  return get(computeId(app, key));
}

function computeId(app, key) {
  return `${app}.${key}`;
}

export default {
  get: getVar,
  set: setVar,
  remove: removeVar,
  show,
  apps,
  list,
  help: () => ({
    description: 'Manage environment variables',
    commands: {
      'env get [name]': "Get a value for an app's environment variable",
      'env set [name] --app <app> --key <key> --value <value>': 'Set an env var for an app',
      'env remove [name] --app <app> --key <key>': 'Remove an env var for an app',
      'env show [name]': 'Show all env vars for an app',
      'env list': 'List all apps with their env vars',
      'env apps': 'List all defined apps',
    },
    options: {
      name: 'App name',
      app: 'Application name',
      key: 'Environment variable key',
      value: 'Environment variable value',
    },
  }),
};
