import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  Card,
  Typography,
  Button,
  Badge,
  CardHeader,
  Paper,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { formatNumber } from '../../hooks/utils';
import NumbersIcon from '@mui/icons-material/Numbers';

const formatGwei = (n) => {
  return formatNumber(n * 0.000000001, 'financial');
};

const INTERVAL_TIME = 10000;
const PROGRESS_INTERVAL_TIME = 1000;

const SYMBOLS = {
  EUR: '€',
  USD: '$',
};

const getPriceFormatted = (data) => {
  const symbol = SYMBOLS[data.currency];

  return `${formatNumber(data.amount)} ${symbol}`;
};

const PriceTracker = () => {
  const [prices, setPrices] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const fetchPrices = async () => {
    setLoading(true);
    const solanaPrice = await (
      await fetch(`https://api.coinbase.com/v2/prices/SOL-${currency}/spot`)
    ).json();

    const ethPrice = await (
      await fetch(`https://api.coinbase.com/v2/prices/ETH-${currency}/spot`)
    ).json();

    setLoading(false);
    setPrices({
      eth: ethPrice.data,
      sol: solanaPrice.data,
    });
  };

  useEffect(() => {
    const getData = async () => {
      await fetchPrices();
    };

    if (progress === 0) {
      getData();
    }
  }, [progress]);

  useEffect(() => {
    const progressInterval = setInterval(async () => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        } else {
          return prev + (PROGRESS_INTERVAL_TIME / INTERVAL_TIME) * 100;
        }
      });
    }, PROGRESS_INTERVAL_TIME);

    if (error) {
      clearInterval(progressInterval);
    }

    return () => clearInterval(progressInterval);
  }, [error]);

  return (
    <div style={{ color: 'white', position: 'relative' }}>
      <Backdrop
        sx={{
          position: 'absolute',
        }}
        open={loading}
      >
        <CircularProgress variant="indeterminate" />
      </Backdrop>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={6}>
          <Paper sx={{ background: '#28526E', color: '#CCDFD5' }}>
            <Typography variant="body2" color="#B8B9BB" fontWeight="bold">
              ETH
            </Typography>
            <Typography variant="body1" color="#E3E3F0" fontWeight="bold">
              {prices ? getPriceFormatted(prices['eth']) : '--'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ background: '#28526E', color: '#CCDFD5' }}>
            <Typography variant="body2" color="#B8B9BB" fontWeight="bold">
              SOL
            </Typography>
            <Typography variant="body1" color="#E3E3F0" fontWeight="bold">
              {prices ? getPriceFormatted(prices['sol']) : '--'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default PriceTracker;
