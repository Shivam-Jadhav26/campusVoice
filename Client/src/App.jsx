// import React from 'react'
// import { Toaster } from "react-hot-toast"
// import LoginLanding from './pages/LoginLanding'
// import Dashboard from './pages/Dashboard'
// import Employee from './pages/Employee'
// import Attendence from './pages/Attendence'
// import Payslip from './pages/Payslip'
// import Setting from './pages/Setting'
// import PrintPayslip from './pages/PrintPayslip'

// const App = () => {
//   return (
//     <>
//     <Toaster/>
//     <Routes>
//       <Route path = "/login" element={<LoginLandin/>}/> 
//       <Route element={<Layout/>}></Route>
//         <Route path="/dashboard" element={<Dashboard/>} /> 
//         <Route path="/employee" element={<Employee />} /> 
//         <Route path="/attendence" element={<Attendence />} /> 
//         <Route path="/payslip" element={<Payslip />} /> 
//         <Route path="/setting" element={<Setting />} /> 

//     </Routes>
//       <Route path="/print/payslips/:id" element={<PrintPayslip />} /> 
//       <Route path="*" element={<Navigate to = "Dashboard" replace />} /> 

//     </>
//   )
// }


// export default App
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginLanding from './pages/LoginLanding';
import Dashboard from './pages/Dashboard';
import Employee from './pages/Employee';
import Attendence from './pages/Attendence';
import Payslip from './pages/Payslip';
import Setting from './pages/Setting';
import PrintPayslip from './pages/PrintPayslip';
import Layout from './pages/Layout'; // Added missing import wrapper assuming path
import LoginForm from './component/LoginForm';

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/login/admin" element={<LoginForm role="admin" title= "Admin Portal" subtitle="Sign in to manage the organization"/>}/>
        <Route path="/login/employee" element={<LoginForm role="employee" title="employee Portal" subtitle="Sign in to access your account" />} />


        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/attendence" element={<Attendence />} />
          <Route path="/payslip" element={<Payslip />} />
          <Route path="/setting" element={<Setting />} />
        </Route>
        <Route path="/print/payslips/:id" element={<PrintPayslip />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;

