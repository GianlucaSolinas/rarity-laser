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

  const { isInitialized } = useMoralis();
  const Web3Api = useMoralisWeb3Api();

  const fetchBlockAndGas = async () => {
    setLoading(true);
    try {
      const date = await Web3Api.native.getDateToBlock({
        chain: 'eth',
        date: Date.now(),
      });

      const result = await Web3Api.native.getBlock({
        block_number_or_hash: date.block,
      });

      const { gas_limit, base_fee_per_gas, transaction_count } = result;

      setBlockNumber((prev) => {
        if (prev !== null && prev !== date.block) {
          setBlockNew(true);
        } else {
          setBlockNew(false);
        }
        return date.block;
      });
      setBaseFee(base_fee_per_gas);
      setTransactions(transaction_count);
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

    if (isInitialized && progress === 0) {
      getData();
    }
  }, [isInitialized, progress]);

  useEffect(() => {
    if (isInitialized) {
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
    }
  }, [isInitialized, error]);

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
                <Typography variant="body2" color="#9AB37F">
                  Base fee
                </Typography>
                <Typography variant="body1" color="#E3E3F0" fontWeight="bold">
                  {baseFee ? formatGwei(baseFee) : '--'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ background: '#282c34' }}>
                <Typography variant="body2" color="#9AB37F">
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
          color="success"
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
