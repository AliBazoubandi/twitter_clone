import 'stop-runaway-react-effects/hijack';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppProviders from 'context/AppProviders';

ReactDOM.render(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root')
);
