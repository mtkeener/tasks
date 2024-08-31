import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:3001/api';

const NewTaskButton = ({ onAddTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    user_id: '',
    task_type: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    duration: 30
  });
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchTaskTypes();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      const types = [...new Set(response.data.map(task => task.task_type))];
      setTaskTypes(types);
    } catch (error) {
      console.error('Error fetching task types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddTask(newTask);
      setIsFormOpen(false);
      setNewTask({
        user_id: '',
        task_type: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        duration: 30
      });
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  };

  const handleNewTaskType = () => {
    const newType = prompt('Enter new task type:');
    if (newType && !taskTypes.includes(newType)) {
      setTaskTypes([...taskTypes, newType]);
      setNewTask(prevTask => ({ ...prevTask, task_type: newType }));
    }
  };

  const handleNewUser = () => {
    const newUser = prompt('Enter new user name:');
    if (newUser) {
      axios.post(`${API_BASE_URL}/users`, { name: newUser })
        .then(response => {
          setUsers([...users, response.data]);
          setNewTask(prevTask => ({ ...prevTask, user_id: response.data.id }));
        })
        .catch(error => console.error('Error adding new user:', error));
    }
  };

  return (
    <div className="new-task-button">
      {!isFormOpen && (
        <button className="floating-button" onClick={() => setIsFormOpen(true)}>+</button>
      )}
      {isFormOpen && (
        <div className="new-task-form">
          <h3>Add New Task</h3>
          <form onSubmit={handleSubmit}>
            <select
              name="user_id"
              value={newTask.user_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
              <option value="new">Add New User</option>
            </select>
            {newTask.user_id === 'new' && (
              <button type="button" onClick={handleNewUser}>Add User</button>
            )}
            <select
              name="task_type"
              value={newTask.task_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Task Type</option>
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="new">Add New Task Type</option>
            </select>
            {newTask.task_type === 'new' && (
              <button type="button" onClick={handleNewTaskType}>Add Task Type</button>
            )}
            <input
              type="text"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Description"
            />
            <input
              type="date"
              name="date"
              value={newTask.date}
              onChange={handleInputChange}
              required
            />
            <input
              type="time"
              name="time"
              value={newTask.time}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="duration"
              value={newTask.duration}
              onChange={handleInputChange}
              min="1"
              required
            />
            <button type="submit">Add Task</button>
            <button type="button" onClick={() => setIsFormOpen(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewTaskButton;
