import { PriceChange } from '@mui/icons-material';
import {
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  ButtonGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralisWeb3Api } from 'react-moralis';
import { formatNumber, numberWithCommas } from '../../hooks/utils';
import Trend from './Trend';
import Moralis from 'moralis';

const FloorPriceAnalysis = ({ collectionObject }) => {
  const floorPrice = collectionObject.stats?.floor_price;
  const [trend, setTrend] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const Web3Api = useMoralisWeb3Api();

  useEffect(() => {
    const fetchNFTLowestPrice = async (options) => {
      const NFTLowestPrice = await Web3Api.token.getNFTLowestPrice(options);
      return NFTLowestPrice;
    };
    const primaryContract = collectionObject
      ? collectionObject.primary_asset_contracts[0]
      : null;

    if (primaryContract) {
      const options = {
        address: primaryContract.address,
      };

      setLoadingTrend(true);

      fetchNFTLowestPrice(options).then((res) => {
        console.log('res', res);

        const changeCount =
          formatNumber(Moralis.Units.FromWei(res.price)) - floorPrice;

        setLoadingTrend(false);
        setTrend({
          lastVisit: new Date(res.block_timestamp),
          change: {
            percentage: formatNumber((changeCount / floorPrice) * 100),
            count: changeCount,
          },
        });
      });
    }
  }, [collectionObject]);

  return (
    <Paper
      elevation={1}
      style={{
        minWidth: '10vw',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        borderRadius: '5px',
      }}
    >
      <Tooltip title={numberWithCommas(floorPrice)}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <PriceChange
            htmlColor="white"
            style={{ width: '25px', height: '25px' }}
          />

          <Typography fontWeight="bold" variant="h6">
            {floorPrice || '---'}
          </Typography>
        </Stack>
      </Tooltip>
      <Typography variant="subtitle2">floor price</Typography>

      {loadingTrend ? (
        <Skeleton sx={{ bgcolor: 'grey.400' }} />
      ) : (
        <Trend trend={trend} notAvailable={floorPrice === null} />
      )}
    </Paper>
  );
};

export default FloorPriceAnalysis;
