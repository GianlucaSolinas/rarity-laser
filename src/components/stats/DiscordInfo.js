import { Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { FaDiscord } from 'react-icons/fa';
import { useQuery } from 'react-query';
import {
  abbrevNumber,
  formatNumber,
  numberWithCommas,
} from '../../hooks/utils';
import { fetchDiscordMembers } from '../../queries/trend';
import Trend from './Trend';

const DiscordInfo = ({ discordUrl }) => {
  const splitLink = discordUrl.split('/');

  const { data, isLoading, error } = useQuery(
    ['fetchDiscordMembers', { guildCode: splitLink.pop() }],
    fetchDiscordMembers
  );

  let membersCount = 0;
  let trend = null;

  if (data) {
    membersCount = data.approximate_member_count;

    if (data.trend && data.trend.length) {
      const oldestLog = data.trend[0];

      const changeCount =
        oldestLog.data.approximate_member_count - membersCount;

      trend = {
        logs: data.trend,
        change: {
          percentage: formatNumber((changeCount / membersCount) * 100),
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
      <Tooltip title={numberWithCommas(membersCount)}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <FaDiscord style={{ width: '25px', height: '25px' }} />

          <Typography fontWeight="bold" variant="h6">
            {isLoading ? (
              <Skeleton sx={{ bgcolor: 'grey.400' }} width={50} />
            ) : membersCount ? (
              abbrevNumber(membersCount)
            ) : (
              '---'
            )}
          </Typography>
        </Stack>
      </Tooltip>
      <Typography variant="subtitle2">members</Typography>

      <Trend trend={trend} />
    </Paper>
  );
};

export default DiscordInfo;
