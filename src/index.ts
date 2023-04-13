import { Model, NotNull, Property, Query, Resource, SQLiteDriver, Unique } from '@cloud-cli/store';
import { init } from '@cloud-cli/cli';

const appNotSpecifiedError = new Error('App not specified');
const keyNotSpecifiedError = new Error('Key not specified');

@Model('env')
class EnvEntry extends Resource {
  @Unique() @NotNull() @Property(String) app: string;
  @Unique() @NotNull() @Property(String) key: string;
  @Property(String) value: string;
}

export interface App {
  app: string;
}

export interface KeyValue {
  key: string;
  value?: string;
}

export interface AppKeyValue extends App, KeyValue { }

async function reload() {
  Resource.use(new SQLiteDriver());
  await Resource.create(EnvEntry);
}

async function show(options: App) {
  const { app } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  return Resource.find(EnvEntry, new Query<EnvEntry>().where('app').is(app));
}

async function apps() {
  const rows = await Resource.find(EnvEntry, new Query<EnvEntry>());
  return Array.from(new Set(rows.map(entry => entry.app)));
}

async function set(options: AppKeyValue) {
  const { app, key, value } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  const entry = new EnvEntry({ app, key, value });
  await entry.save();

  return entry;
}

async function remove(options: AppKeyValue) {
  const { app, key } = options;
  const found = await get({ app, key })

  if ((found).length) {
    return void await found[0].remove();
  }
}

async function get(options: Omit<AppKeyValue, 'value'>) {
  const { app, key } = options;

  if (!app) {
    throw appNotSpecifiedError;
  }

  if (!key) {
    throw keyNotSpecifiedError;
  }

  return Resource.find(EnvEntry, new Query<EnvEntry>().where('app').is(app).where('key').is(key));
}


export default { get, set, show, remove, apps, reload, [init]: reload };
