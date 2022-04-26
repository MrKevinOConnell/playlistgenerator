import React from 'react';
import logo from './logo.svg';
import './App.css';
import CompleteApp from './CompleteApp';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
function App() {
  return (
   <Router> <Routes><Route path="/" element={<CompleteApp />}/>  </Routes></Router>
  );
}

export default App;

