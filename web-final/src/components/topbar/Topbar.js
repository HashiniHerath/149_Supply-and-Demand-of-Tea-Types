import React, { useState, useEffect } from 'react';
import './topbar.css';

const Topbar = () => {
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [showPopup, setShowPopup] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const handleLogin = () => {
    if (inputUsername === 'admin' && inputPassword === 'admin123') {
      localStorage.setItem('username', inputUsername);
      localStorage.setItem('userRole', 'admin');
      setUsername(inputUsername);
      setUserRole('admin');
      setShowPopup(false);
      window.location.reload();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="topbar">
      <div className="toggle">
        <ion-icon name="menu-outline"></ion-icon>
      </div>
      <div className="user">
        {username && userRole ? (
          <img src={'https://i.pinimg.com/originals/26/61/9c/26619c16b5451afaa95956dff93ae3e5.jpg'} alt='icon'/>
        ) : (
          <button 
            onClick={() => setShowPopup(true)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Login
          </button>
        )}
      </div>
      {showPopup && (
        <div style={{
          position: 'fixed',
          zIndex: 999,
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            textAlign: 'center'
          }}>
            <h3>Login</h3>
            <input 
              type="text" 
              placeholder="Username" 
              value={inputUsername} 
              onChange={(e) => setInputUsername(e.target.value)}
              style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={inputPassword} 
              onChange={(e) => setInputPassword(e.target.value)}
              style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
            />
            <br />
            <button onClick={handleLogin} style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              marginRight: '10px'
            }}>Login</button>
            <button onClick={() => setShowPopup(false)} style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '10px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px'
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
