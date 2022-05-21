import React from 'react';
import { render } from 'react-dom';

import Newtab from './Newtab';
import './index.css';
import AppProvider from '../../components/AppProvider';

render(
  <AppProvider>
    <Newtab />
  </AppProvider>,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
