import React, { useState } from 'react';
import './forms.css';
import CustomButton from '../../components/buttons/CustomButton';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    console.log("Form Data:", formData);
    navigate('/forms/sign-in')
  };

  return (
    <div className='form-container'>
        <div className="signup-page">
            <div className="quote-section">
                <h1>“Let's Make it Happen Together!”</h1>
            </div>
            <div className="form-section">
                <h2>Create An Account</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    />
                    <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                <div className="form-row">
                    <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    />
                    <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                <div className="form-row">
                    <input
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    />
                    <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                <div className="terms">
                    <input type="checkbox" required />
                    <span>
                    Creating your account means you accept our <a href="#">Terms & Conditions</a>.
                    </span>
                </div>
                {/* <button type="submit" className="create-account-btn">Create Account</button> */}
                <CustomButton 
                    text="Create Account" 
                    onClick={() => handleSubmit()} 
                    color="#232323" 
                    filled={false}
                />
                <div className="social-signup">
                    <button className="facebook-btn">Sign up using Facebook</button>
                    <button className="twitter-btn">Sign up using Twitter</button>
                </div>
                </form>
                <p className="signin-link">Already have an account? <Link to={'/forms/sign-in'}>Sign in here</Link></p>
            </div>
        </div>
    </div>
    
  );
};

export default SignUpPage;
