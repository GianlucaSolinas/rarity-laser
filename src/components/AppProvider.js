import React from 'react';
// import { UserProvider } from '../hooks/user.js';
import EventEmitter from 'events';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../hooks/theme';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// const events = new EventEmitter();
// events.setMaxListeners(1000);

// export const EventEmitterContext = React.createContext(events);
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
      {/* <UserProvider>{children}</UserProvider> */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
