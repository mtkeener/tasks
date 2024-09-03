import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO, 
  addHours, 
  startOfDay, 
  endOfDay } from 'date-fns';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Calendar = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [view, setView] = useState('month');
  const history = useHistory();

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 768 ? 'week' : 'month');
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const days = view === 'month'
      ? getMonthDays(currentDate)
      : getWeekDays(currentDate);
    setCalendarDays(days);
  }, [currentDate, view]);

  const getMonthDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getWeekDays = (date) => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return eachDayOfInterval({ start, end });
  };

  const getTaskCountForDay = (day) => {
    return tasks.filter(task => isSameDay(new Date(task.date), day)).length;
  };

  const handleDayClick = (day) => {
    history.push(`/day/${format(day, 'yyyy-MM-dd')}`);
  };

  const handlePrevious = () => {
    setCurrentDate(prevDate => view === 'month'
      ? new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
      : new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 7)
    );
  };

  const handleNext = () => {
    setCurrentDate(prevDate => view === 'month'
      ? new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
      : new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 7)
    );
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevious}>&lt;</button>
        <h2>{format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM dd, yyyy')}</h2>
        <button onClick={handleNext}>&gt;</button>
      </div>
      <div className={`calendar-grid ${view}`}>
        {calendarDays.map(day => (
          <div
            key={day.toISOString()}
            className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <span className="day-number">{format(day, 'd')}</span>
            <span className="task-count">{getTaskCountForDay(day)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DayView = ({ date, tasks, onUpdateTask }) => {
  const [hourlyTasks, setHourlyTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchTaskTypes();
    organizeTasksByHour();
  }, [tasks]);

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

  const organizeTasksByHour = () => {
    const dayStart = startOfDay(parseISO(date));
    const hourlyTasksArray = Array(24).fill().map((_, index) => ({
      hour: format(addHours(dayStart, index), 'HH:mm'),
      tasks: []
    }));

    tasks.forEach(task => {
      const taskHour = parseISO(task.date + 'T' + task.time).getHours();
      hourlyTasksArray[taskHour].tasks.push(task);
    });

    setHourlyTasks(hourlyTasksArray);
  };

  const handleEditClick = (task) => {
    setEditingTask({ ...task });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateTask(editingTask);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="day-view">
      <h2>Tasks for {format(parseISO(date), 'MMMM d, yyyy')}</h2>
      <div className="hourly-schedule">
        {hourlyTasks.map(({ hour, tasks }) => (
          <div key={hour} className="hour-slot">
            <div className="hour-label">{hour}</div>
            <div className="hour-tasks">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  {editingTask && editingTask.id === task.id ? (
                    <form onSubmit={handleEditSubmit}>
                      <select
                        name="user_id"
                        value={editingTask.user_id}
                        onChange={handleEditChange}
                      >
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                      <select
                        name="task_type"
                        value={editingTask.task_type}
                        onChange={handleEditChange}
                      >
                        {taskTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="description"
                        value={editingTask.description || ''}
                        onChange={handleEditChange}
                        placeholder="Description"
                      />
                      <input
                        type="time"
                        name="time"
                        value={editingTask.time}
                        onChange={handleEditChange}
                      />
                      <input
                        type="number"
                        name="duration"
                        value={editingTask.duration}
                        onChange={handleEditChange}
                        min="1"
                      />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingTask(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <strong>{task.task_type}</strong>
                      <p>{task.description}</p>
                      <p>Duration: {task.duration} minutes</p>
                      <p>Assigned to: {users.find(user => user.id === task.user_id)?.name || 'Unknown'}</p>
                      <button onClick={() => handleEditClick(task)}>Edit</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default { Calendar, DayView };
