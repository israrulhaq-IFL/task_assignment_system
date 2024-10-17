// // src/routes.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import TaskList from './components/TaskList';
// import TaskForm from './components/TaskForm';
// import DepartmentManagement from './pages/DepartmentManagement'; // Import the DepartmentManagement page

// const AppRoutes = ({ tasks, addTask }) => (
//   <Router>
//     <Routes>
//       <Route exact path="/" element={<TaskList tasks={tasks} />} />
//       <Route path="/add-task" element={<TaskForm addTask={addTask} />} />
//       <Route path="/departments" element={<DepartmentManagement />} /> 
//       <Route path="/sub-departments" element={<SubDepartmentManagement />} />
//       <Route path="*" element={<h1>Not Found</h1>} />
//       {/* Add more routes as needed */}
//     </Routes>
//   </Router>
// );

// export default AppRoutes;