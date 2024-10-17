import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ role, departmentId, subDepartmentId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let url = '';
    if (role === 'HOD') {
      url = `/api/tasks/department/${departmentId}`;
    } else if (role === 'Manager') {
      url = `/api/tasks/sub-department/${subDepartmentId}`;
    } else if (role === 'Team Member') {
      url = `/api/tasks/sub-department/${subDepartmentId}`;
    } else if (role === 'Super Admin') {
      url = `/api/tasks`;
    }

    axios.get(url)
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the tasks!', error);
      });
  }, [role, departmentId, subDepartmentId]);

  return (
    <div>
      <h1>{role} Dashboard</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.task_id}>{task.title} - {task.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;