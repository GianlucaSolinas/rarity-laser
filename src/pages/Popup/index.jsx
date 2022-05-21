import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup.jsx';
import './index.css';
import AppProvider from '../../components/AppProvider';

render(
  <AppProvider>
    <Popup />
  </AppProvider>,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
