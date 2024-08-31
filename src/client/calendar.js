import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

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

export default Calendar;
