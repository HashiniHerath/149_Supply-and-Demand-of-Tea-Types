import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import OpenPage from './navigations/Open.page';
import SignUpPage from './navigations/forms/SIgnUp';
import SignInPage from './navigations/forms/SignIn';
import Dashboard from './navigations/dashboard/Dashboard';
import SalesPage from './navigations/dashboard/SalesPage';
import CountriesDemandPage from './navigations/dashboard/CountriesDemandPage';
import TeaTypesPage from './navigations/dashboard/TeaTypesPage';
import SocialMediaPage from './navigations/dashboard/SocialMediaPage';
import AboutUs from './navigations/AboutUs';
import Services from './navigations/Services';
import TeaTypesWholePage from './navigations/dashboard/TeaTypesWholePage';
import SalesPieChart from './navigations/dashboard/SalesPieChart';
import SalesPiePage from './navigations/dashboard/SalesPiePage';

function App() {
  const [redirectRoute, setRedirectRoute] = useState('/welcome');

  useEffect(() => {
    const changeRoute = () => {
      console.log("check")
      if (localStorage.getItem('username')) {
        if (localStorage.getItem('passed') === "Passed") {
          setRedirectRoute('/dashboard');
          // history('/dashboard')
        } else {
          setRedirectRoute('/welcome');
          // history('/quest-begin')
        }
      }
    };
    changeRoute();
  }, []);

  return (
    <div className="App">
      <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to={redirectRoute} replace />} />
          <Route path="/welcome" element={<OpenPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/forms/sign-up" element={<SignUpPage />} />
          <Route path="/forms/sign-in" element={<SignInPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales-all" element={<SalesPiePage />} />
          <Route path="/export-demand" element={<CountriesDemandPage />} />
          <Route path="/tea-types" element={<TeaTypesPage />} />
          <Route path="/tea-types-whole" element={<TeaTypesWholePage />} />
          <Route path="/soocial-media" element={<SocialMediaPage />} />
        </Routes>
      </div>
    </Router>
    </div>
  );
}

export default App;
