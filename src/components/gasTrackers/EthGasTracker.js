import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  Card,
  Typography,
  CardContent,
  Button,
  Badge,
  CardHeader,
  Paper,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { formatNumber } from '../../hooks/utils';
import { Replay } from '@mui/icons-material';

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

const EthGasTracker = () => {
  const [blockNumber, setBlockNumber] = useState(null);
  const [isBlockNew, setBlockNew] = useState(false);
  const [baseFee, setBaseFee] = useState(null);
  const [prices, setPrices] = useState(null);
  const [currentTransactions, setTransactions] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const fetchBlockAndGas = async () => {
    setLoading(true);
    try {
      const ethscanblock = await (
        await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${'4E8HDMCZP2NJGEQBVFRUNI19A3UD67M5FZ'}`
        )
      ).json();

      const block_number_int = parseInt(ethscanblock.result);

      const { result } = await (
        await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${
            ethscanblock.result
          }&boolean=true&apikey=${'4E8HDMCZP2NJGEQBVFRUNI19A3UD67M5FZ'}`
        )
      ).json();

      const { baseFeePerGas, transactions } = result;

      setBlockNumber((prev) => {
        if (prev !== null && prev !== block_number_int) {
          setBlockNew(true);
        } else {
          setBlockNew(false);
        }
        return block_number_int;
      });
      setBaseFee(baseFeePerGas);
      setTransactions(transactions.length);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await fetchBlockAndGas();
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

  const REMAINING_SECONDS =
    (INTERVAL_TIME - (progress * INTERVAL_TIME) / 100) / 1000;

  return (
    <div style={{ color: 'white' }}>
      {error && (
        <div>
          <Typography>{error.message}</Typography>
          <Button
            onClick={() => {
              setProgress(0);
              setError(null);
            }}
            variant="contained"
            startIcon={<Replay />}
          >
            Retry
          </Button>
        </div>
      )}
      <Card
        sx={{ position: 'relative', background: '#28526E', color: '#CCDFD5' }}
      >
        <Backdrop
          sx={{
            position: 'absolute',
          }}
          open={loading}
        >
          <CircularProgress variant="indeterminate" />
        </Backdrop>
        <CardHeader
          titleTypographyProps={{
            fontSize: '16px',
            padding: '0px 4px',
          }}
          title={
            <Badge
              variant="dot"
              invisible={!isBlockNew}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#59904C',
                },
              }}
            >
              Block #{blockNumber || '---'}
            </Badge>
          }
        ></CardHeader>
        <CardContent>
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={6}>
              <Paper sx={{ background: '#282c34' }}>
                <Typography variant="body2" color="primary">
                  Base fee
                </Typography>
                <Typography variant="body1" color="#E3E3F0" fontWeight="bold">
                  {baseFee ? formatGwei(baseFee) : '--'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ background: '#282c34' }}>
                <Typography variant="body2" color="primary">
                  Transactions
                </Typography>
                <Typography variant="body1" color="#E3E3F0" fontWeight="bold">
                  {currentTransactions}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
        <Typography variant="subtitle2">
          {REMAINING_SECONDS
            ? `Next refresh in ${formatNumber(
                REMAINING_SECONDS,
                'integer'
              )} seconds`
            : 'Refreshing...'}
        </Typography>
        <LinearProgress
          color="primary"
          variant="determinate"
          value={progress}
          sx={{
            height: '12px',
          }}
        />
      </Card>
    </div>
  );
};

export default EthGasTracker;
