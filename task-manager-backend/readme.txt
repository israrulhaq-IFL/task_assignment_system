# Check the status of your processes
pm2 status

# View logs
pm2 logs task-manager-backend

# Stop the process
pm2 stop task-manager-backend

# Restart the process
pm2 restart task-manager-backend

# Delete the process
pm2 delete task-manager-backend

# Save the current process list
pm2 save

# Set up pm2 to start on system boot
pm2 startup