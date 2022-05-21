import React from 'react';
import logo from '../../assets/img/logo.svg';
import AuthStatus from '../../components/AuthStatus';
import './Newtab.css';
import './Newtab.scss';

const Newtab = () => {
  return (
    <div className="App">
      <div className="App-header">
        <AuthStatus />
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <h6>The color of this paragraph is defined using SASS.</h6>
      </div>
    </div>
  );
};

export default Newtab;
