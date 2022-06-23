import {
  Container,
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
import PriceTracker from '../../components/gasTrackers/PriceTracker';

const Popup = () => {
  const [extensionConfig, setExtensionConfig] = useExtensionConfig();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const mainLogo = chrome.runtime.getURL('Spy-O1.png');

  return (
    <div className="App">
      <img src={mainLogo} alt="logo" width="100%" height="auto" />
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

      <Container sx={{ marginBottom: '1rem' }}>
        <Typography color="primary" variant="subtitle2">
          PRICE TRACKER
        </Typography>
        <PriceTracker />
      </Container>

      <Container>
        <Typography color="primary" variant="subtitle2">
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
