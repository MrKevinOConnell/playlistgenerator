import React from 'react';
import './App.css';
import CompleteApp from './CompleteApp';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify';
function App() {
  return (
    <>
  <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
/>
   <Router> <Routes><Route path="/" element={<CompleteApp />}/>  </Routes></Router>
   </>
  );
}

export default App;

