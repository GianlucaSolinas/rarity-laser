import React from 'react';
// import { UserProvider } from '../hooks/user.js';
import EventEmitter from 'events';
import { MoralisProvider } from 'react-moralis';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../hooks/theme';

const events = new EventEmitter();
events.setMaxListeners(1000);
export const EventEmitterContext = React.createContext(events);
// export const GlobalConfigContext = React.createContext({
//   autoQueueAddresses,
//   refreshQueued,
//   autoImageReplaceAddresses,
//   imageReplaced,
// });

const AppProvider = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MoralisProvider
        serverUrl="https://matgrqe0cq1z.usemoralis.com:2053/server"
        appId="UHCopLz11iLSe1fk4yQ81qjpU4tvaAuG5WAlHuHi"
      >
        {/* <UserProvider>{children}</UserProvider> */}
        {children}
      </MoralisProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
