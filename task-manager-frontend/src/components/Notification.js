import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get(`/api/notifications/${userId}`)
      .then(response => {
        setNotifications(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the notifications!', error);
      });
  }, [userId]);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;