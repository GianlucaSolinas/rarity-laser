import { CheckCircle, Warning } from '@mui/icons-material';
import { Alert, Paper, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

const BundleVerification = ({ numAddresses }) => {
  const verified = numAddresses === 1;

  return (
    <Paper
      sx={{
        padding: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Alert severity={verified ? 'success' : 'warning'}>
        {verified
          ? 'Bundle verified! Every item belongs to the same collection.'
          : `Bundle not verified! This bundle contains items from ${numAddresses} different collections.`}
      </Alert>
    </Paper>
  );
};

export default BundleVerification;
