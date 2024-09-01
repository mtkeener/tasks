import sqlite3 from 'sqlite3';
import { resolve as _resolve } from 'path';

//const sqlite3 = sqlite3()
const dbPath = 'tasks.db';

let db;

function openDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      resolve(db);
    });
  });
}

async function initializeDatabase() {
  try {
    await openDatabase();
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

function createTables() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `, (err) => {
      if (err) reject(err);
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          task_type TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

async function addTask(task) {
  return new Promise((resolve, reject) => {
    const { user_id, task_type, description, date, time, duration } = task;
    db.run(
      'INSERT INTO tasks (user_id, task_type, description, date, time, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, task_type, description, date, time, duration],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
}

async function getTasks(filters = {}) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM tasks';
    const whereConditions = [];
    const params = [];

    if (filters.user_id) {
      whereConditions.push('user_id = ?');
      params.push(filters.user_id);
    }
    if (filters.task_type) {
      whereConditions.push('task_type = ?');
      params.push(filters.task_type);
    }
    if (filters.start_date && filters.end_date) {
      whereConditions.push('date BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

async function updateTask(taskId, updates) {
  return new Promise((resolve, reject) => {
    const { task_type, description, date, time, duration } = updates;
    db.run(
      'UPDATE tasks SET task_type = ?, description = ?, date = ?, time = ?, duration = ? WHERE id = ?',
      [task_type, description, date, time, duration, taskId],
      function(err) {
        if (err) reject(err);
        resolve(this.changes);
      }
    );
  });
}

async function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function(err) {
      if (err) reject(err);
      resolve(this.changes);
    });
  });
}

async function addUser(name) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (name) VALUES (?)', [name], function(err) {
      if (err) reject(err);
      resolve(this.lastID);
    });
  });
}

async function getUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export {
  initializeDatabase,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  addUser,
  getUsers
};
