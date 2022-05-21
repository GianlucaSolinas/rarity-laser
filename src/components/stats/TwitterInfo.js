import { Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { FaTwitter } from 'react-icons/fa';
import { useMoralisCloudFunction } from 'react-moralis';
import {
  abbrevNumber,
  formatNumber,
  numberWithCommas,
} from '../../hooks/utils';
import Trend from './Trend';

const TwitterInfo = ({ twitterLink }) => {
  const splitLink = twitterLink.split('/');
  const { data, isLoading, error } = useMoralisCloudFunction(
    'getTwitterFollowers',
    {
      name: splitLink.pop(),
    }
  );

  let followersCount = 0;
  let trend = null;

  if (data) {
    followersCount = data.data.public_metrics.followers_count;

    if (data.trend) {
      const changeCount = data.trend.lastData.followers_count - followersCount;

      trend = {
        ...data.trend,
        change: {
          percentage: formatNumber((changeCount / followersCount) * 100),
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
        color: 'white',
        borderRadius: '5px',
        background: '#282c34',
      }}
    >
      <Tooltip title={numberWithCommas(followersCount)}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <FaTwitter style={{ width: '25px', height: '25px' }} />
          <Typography fontWeight="bold" variant="h6">
            {isLoading ? (
              <Skeleton sx={{ bgcolor: 'grey.400' }} width={50} />
            ) : followersCount ? (
              abbrevNumber(followersCount)
            ) : (
              '---'
            )}
          </Typography>
        </Stack>
      </Tooltip>
      <Typography variant="subtitle2">followers</Typography>

      <Trend trend={trend} />
    </Paper>
  );
};

export default TwitterInfo;
