import {
  Container,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import React from 'react';
import { useExtensionConfig } from '../../hooks/extensionConfig';
import './Popup.css';
import AuthStatus from '../../components/AuthStatus';
import EthGasTracker from '../../components/gasTrackers/EthGasTracker';
import { useMoralis } from 'react-moralis';
import PriceTracker from '../../components/gasTrackers/PriceTracker';

const Popup = () => {
  const [extensionConfig, setExtensionConfig] = useExtensionConfig();
  const { isAuthenticated } = useMoralis();

  return (
    <div className="App">
      <AuthStatus />

      {extensionConfig && (
        <div className="App-header">
          <FormControlLabel
            control={<Switch checked={extensionConfig.enabled} />}
            label="Allow Rarity Laser to inject into OpenSea web pages."
            onChange={(event) => {
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
        {isAuthenticated ? (
          <EthGasTracker />
        ) : (
          <Typography variant="caption" color="white">
            Please login to view Gas tracker
          </Typography>
        )}
      </Container>
    </div>
  );
};

export default Popup;
