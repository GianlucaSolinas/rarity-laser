import {
  Container,
  Divider,
  FormControlLabel,
  Snackbar,
  Switch,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useExtensionConfig } from '../../hooks/extensionConfig';
import './Popup.css';
// import AuthStatus from '../../components/AuthStatus';
import EthGasTracker from '../../components/gasTrackers/EthGasTracker';
// import { useMoralis } from 'react-moralis';
import PriceTracker from '../../components/gasTrackers/PriceTracker';

const Popup = () => {
  const [extensionConfig, setExtensionConfig] = useExtensionConfig();
  // const { isAuthenticated } = useMoralis();
  const [showSnackbar, setShowSnackbar] = useState(false);

  return (
    <div className="App">
      {/* <AuthStatus /> */}

      {extensionConfig && (
        <div className="App-header">
          <FormControlLabel
            control={<Switch size="small" checked={extensionConfig.enabled} />}
            label={
              <Typography variant="caption">
                Allow Spy Volcano to inject into OpenSea
              </Typography>
            }
            onChange={(event) => {
              setShowSnackbar(true);
              setExtensionConfig({
                ...extensionConfig,
                enabled: event.target.checked,
              });
            }}
          />
        </div>
      )}

      <Divider sx={{ borderColor: '#9AB37F', marginTop: '4px' }} />

      <Container>
        <Typography sx={{ color: '#9AB37F' }} variant="subtitle2">
          PRICES TRACKER
        </Typography>
        <PriceTracker />
      </Container>

      <Divider sx={{ borderColor: '#9AB37F', marginTop: '4px' }} />

      <Container>
        <Typography sx={{ color: '#9AB37F' }} variant="subtitle2">
          ETH GAS TRACKER
        </Typography>
        <EthGasTracker />
      </Container>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => {
          setShowSnackbar(false);
        }}
        message="Refresh all Opensea pages to apply changes."
      />
    </div>
  );
};

export default Popup;
