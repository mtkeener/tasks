import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3001/api';

const Analysis = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [filters, setFilters] = useState({
    user_id: '',
    task_type: '',
    start_date: format(new Date().setDate(1), 'yyyy-MM-dd'), // First day of current month
    end_date: format(new Date(), 'yyyy-MM-dd'), // Today
  });

  useEffect(() => {
    fetchUsers();
    fetchTaskTypes();
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

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

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, { params: filters });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const getTaskSummary = () => {
    const summary = {
      totalTasks: tasks.length,
      totalTime: tasks.reduce((sum, task) => sum + task.duration, 0),
      taskTypeCounts: {},
    };

    tasks.forEach(task => {
      if (summary.taskTypeCounts[task.task_type]) {
        summary.taskTypeCounts[task.task_type]++;
      } else {
        summary.taskTypeCounts[task.task_type] = 1;
      }
    });

    return summary;
  };

  const getChartData = () => {
    const data = {};
    tasks.forEach(task => {
      const date = task.date.split('T')[0];
      if (!data[date]) {
        data[date] = { date, count: 0, totalTime: 0 };
      }
      data[date].count++;
      data[date].totalTime += task.duration;
    });
    return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const summary = getTaskSummary();
  const chartData = getChartData();

  return (
    <div className="analysis">
      <h2>Task Analysis</h2>
      <div className="filters">
        <select name="user_id" value={filters.user_id} onChange={handleFilterChange}>
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <select name="task_type" value={filters.task_type} onChange={handleFilterChange}>
          <option value="">All Task Types</option>
          {taskTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
        />
      </div>
      <div className="summary">
        <h3>Summary</h3>
        <p>Total Tasks: {summary.totalTasks}</p>
        <p>Total Time: {Math.round(summary.totalTime / 60)} hours {summary.totalTime % 60} minutes</p>
        <h4>Task Type Breakdown:</h4>
        <ul>
          {Object.entries(summary.taskTypeCounts).map(([type, count]) => (
            <li key={type}>{type}: {count}</li>
          ))}
        </ul>
      </div>
      <div className="chart">
        <h3>Task Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Task Count" />
            <Line yAxisId="right" type="monotone" dataKey="totalTime" stroke="#82ca9d" name="Total Time (minutes)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analysis;
