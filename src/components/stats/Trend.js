import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { Box, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { ImWarning } from 'react-icons/im';

const EmtpyTrend = () => {
  return (
    <Box textAlign="center">
      <Divider sx={{ borderColor: 'white', margin: '4px 0px' }} />

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <TrendingFlat />
        <Typography variant="body1" align="center" fontWeight="bold">
          ---
        </Typography>
      </Stack>
      <Tooltip
        title="Trend monitoring will start from now. Please visit the collection
          later to see the variation."
      >
        <Typography variant="caption" sx={{ cursor: 'pointer' }}>
          <FaInfoCircle style={{ marginRight: '4px' }} /> INFO
        </Typography>
      </Tooltip>
    </Box>
  );
};

const NotAvailableTrend = () => {
  return (
    <Box textAlign="center">
      <Divider sx={{ borderColor: 'white', margin: '4px 0px' }} />

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <TrendingFlat />
        <Typography variant="body1" align="center" fontWeight="bold">
          ---
        </Typography>
      </Stack>
      <Tooltip title="Data is not available, therefore we cannot start monitoring trend. Please try again later.">
        <Typography variant="caption" sx={{ cursor: 'pointer' }}>
          <ImWarning style={{ marginRight: '4px' }} /> INFO
        </Typography>
      </Tooltip>
    </Box>
  );
};

const Trend = ({ trend, notAvailable = false }) => {
  let trendColor = 'white';

  if (notAvailable) {
    return <NotAvailableTrend />;
  }

  if (!trend) {
    return <EmtpyTrend />;
  }

  if (trend.change.count < 0) {
    trendColor = '#FF6868'; // pinky red
  } else if (trend.change.count > 0) {
    trendColor = '#95B46E';
  }

  return (
    <Tooltip
      title={`${trend.change.count > 0 ? '+' : ''}${
        trend.change.count
      } since ${format(trend.lastVisit, 'dd/MM/yyyy HH:mm')}`}
    >
      <Box textAlign="center">
        <Divider sx={{ borderColor: 'white', margin: '4px 0px' }} />

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          {trend.change.count === 0 && <TrendingFlat />}
          {trend.change.count < 0 && <TrendingDown htmlColor={trendColor} />}
          {trend.change.count > 0 && <TrendingUp htmlColor={trendColor} />}
          <Typography
            variant="body1"
            align="center"
            fontWeight="bold"
            color={trendColor}
          >
            {`${trend.change.percentage > 0 ? '+' : ''}${
              trend.change.percentage
            }% `}
          </Typography>
        </Stack>
        <Typography variant="caption" fontStyle="italic">
          {`in the last ${formatDistanceToNowStrict(trend.lastVisit)}`}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default Trend;
