import { PriceChange } from '@mui/icons-material';
import { Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { formatNumber, numberWithCommas } from '../../hooks/utils';
import Trend from './Trend';
import { fetchOpenseaStats } from '../../queries/trend';
import { useQuery } from 'react-query';

const FloorPriceAnalysis = ({ collectionObject }) => {
  const splitLink = window.location.pathname.split('/');

  const { data, isLoading, error } = useQuery(
    ['fetchOpenseaStats', { slug: splitLink.pop() }],
    fetchOpenseaStats
  );

  let floorPrice = 0;
  let trend = null;

  if (data) {
    floorPrice = data.floor_price;

    if (data.trend && data.trend.length) {
      const oldestLog = data.trend[0];

      const changeCount = oldestLog.data.floor_price - floorPrice;

      trend = {
        logs: data.trend,
        change: {
          percentage: formatNumber((changeCount / floorPrice) * 100),
          count: changeCount,
        },
      };
    }
  }

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

      {isLoading ? (
        <Skeleton sx={{ bgcolor: 'grey.400' }} />
      ) : (
        <Trend trend={trend} notAvailable={floorPrice === null} />
      )}
    </Paper>
  );
};

export default FloorPriceAnalysis;
