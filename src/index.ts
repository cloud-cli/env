import sqlite from 'sqlite3';
import { join } from 'path';

const appNotSpecifiedError = new Error('App not specified');
const keyNotSpecifiedError = new Error('Key not specified');

/* istanbul ignore next */
const valueOrError = (resolve, reject) => (error, value = null) => error ? reject(error) : resolve(value)

let db: sqlite.Database;

const columns = {
  App: 'app',
  Key: 'key',
  Value: 'value',
};

export interface App {
  app: string;
}

export interface KeyValue {
  key: string;
  value?: string;
}

export interface AppKeyValue extends App, KeyValue { }

function close() {
  try {
    db?.close();
  } catch { };
}

function reload() {
  close();

  const inMemory = !!process.env.IN_MEMORY_DB;

  if (inMemory) {
    sqlite.verbose();
  }

  const databasePath = {
    true: ':memory:',
    false: join(process.cwd(), 'env.db')
  }[String(inMemory)];

  db = new sqlite.Database(databasePath);
  db.run(`CREATE TABLE IF NOT EXISTS env (
      ${columns.App} TEXT,
      ${columns.Key} TEXT,
      ${columns.Value} TEXT,
      UNIQUE (${columns.App}, ${columns.Key})
  )`);
}

async function show(options: App) {
  return new Promise((resolve, reject) => {
    const { app } = options;

    if (!app) {
      return reject(appNotSpecifiedError);
    }

    db
      .prepare(`
        SELECT
          ${columns.App},
          ${columns.Key},
          ${columns.Value}
        FROM env WHERE
        ${columns.App} = ?`
      )
      .all([app], valueOrError(resolve, reject));
  });
}

async function apps() {
  return new Promise((resolve, reject) => {
    db
      .prepare(`SELECT ${columns.App} FROM env`)
      .all([], valueOrError(resolve, reject));
  });
}

async function set(options: AppKeyValue) {
  const { app, key, value } = options;

  if (!app) {
    return Promise.reject(appNotSpecifiedError);
  }

  if (!key) {
    return Promise.reject(keyNotSpecifiedError);
  }

  return query('REPLACE INTO env VALUES (?, ?, ?)', [app, key, value]);
}

async function remove(options: AppKeyValue) {
  const { app, key } = options;

  if (!app) {
    return Promise.reject(appNotSpecifiedError);
  }

  if (!key) {
    return Promise.reject(keyNotSpecifiedError);
  }

  return query(`DELETE FROM env WHERE ${columns.App} = ? AND ${columns.Key} = ?`, [app, key])
}

async function get(options: Omit<AppKeyValue, 'value'>) {
  return new Promise((resolve, reject) => {
    const { app, key } = options;

    if (!app) {
      return reject(appNotSpecifiedError);
    }

    if (!key) {
      return reject(keyNotSpecifiedError);
    }

    db.serialize(() => {
      db
        .prepare(`
          SELECT
            ${columns.App},
            ${columns.Key},
            ${columns.Value}
          FROM env WHERE
            ${columns.App} = ? AND ${columns.Key} = ?`
        )
        .all([app, key], valueOrError(resolve, reject));
    });
  });
}

async function query(statement, inputs) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db
        .prepare(statement)
        .run(inputs, valueOrError(resolve, reject));
    });
  })
}


export default { get, set, show, remove, apps, reload };
