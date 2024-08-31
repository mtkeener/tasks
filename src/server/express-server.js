const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
  initializeDatabase,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  addUser,
  getUsers
} = require('./database');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize database
initializeDatabase();

// Task routes
app.post('/api/tasks', async (req, res) => {
  try {
    const taskId = await addTask(req.body);
    res.status(201).json({ id: taskId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Error adding task' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      task_type: req.query.task_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };
    const tasks = await getTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const changes = await updateTask(taskId, req.body);
    if (changes > 0) {
      res.json({ id: taskId, ...req.body });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const changes = await deleteTask(taskId);
    if (changes > 0) {
      res.json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const userId = await addUser(req.body.name);
    res.status(201).json({ id: userId, name: req.body.name });
  } catch (error) {
    res.status(500).json({ error: 'Error adding user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
