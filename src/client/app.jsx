import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import { Calendar, DayView } from './components/Calendar';
import Analysis from './components/Analysis';
import NewTaskButton from './components/NewTaskButton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([
    'Empty dishwasher',
    'Fill dishwasher',
    'Fill laundry',
    'Fold laundry',
    'Cook meal'
  ]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTask);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${updatedTask.id}`, updatedTask);
      setTasks(tasks.map(task => task.id === updatedTask.id ? response.data : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Router>
      <div className="app">
        <Switch>
          <Route exact path="/" component={() => <Calendar tasks={tasks} />} />
          <Route path="/day/:date" component={({ match }) => (
            <DayView
              date={match.params.date}
              tasks={tasks.filter(task => task.date === match.params.date)}
              onUpdateTask={handleUpdateTask}
            />
          )} />
          <Route path="/analysis" component={() => <Analysis tasks={tasks} />} />
        </Switch>
        <NewTaskButton onAddTask={handleAddTask} taskTypes={taskTypes} users={users} />
      </div>
    </Router>
  );
};

export default App;
