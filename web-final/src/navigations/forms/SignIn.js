import React, { useState } from 'react';
import './forms.css';
import CustomButton from '../../components/buttons/CustomButton';
import { Link, useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    console.log("Sign In Data:", formData);
    navigate('/dashboard')
  };

  return (
    <div className='form-container'>
      <div className="signup-page"> {/* Reusing the same container class */}
        <div className="quote-section">
          <h1>“Welcome Back! Let's Continue the Journey Together!”</h1>
        </div>
        <div className="form-section">
          <h2>Sign In to Your Account</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="terms">
              <input type="checkbox" />
              <span>Remember me</span>
            </div>
            <CustomButton 
              text="Sign In" 
              onClick={() => handleSubmit()} 
              color="#232323" 
              filled={false}
            />
            <div className="social-signup">
              <button className="facebook-btn">Sign in using Facebook</button>
              <button className="twitter-btn">Sign in using Twitter</button>
            </div>
          </form>
          <p className="signin-link">Don't have an account? <Link to="/forms/sign-up">Sign up here</Link></p>
          <p className="forgot-password-link"><Link to="/forms/sign-up">Forgot Password?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
