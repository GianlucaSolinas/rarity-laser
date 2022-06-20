import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { orange } from '@mui/material/colors';

const CustomTooltip = styled(({ className, ...props }) => {
  return <Tooltip {...props} classes={{ popper: className }} />;
})(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#282c34',
    border: `1px solid ${orange[700]}`,
    maxWidth: '50vw',
    padding: '8px',
    zIndex: 99999,
    // fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #dadde9',
  },
  '& .RarityLaserTraitTable': {
    background: '#282c34',
  },
  '& .MuiTableCell-stickyHeader': {
    background: '#282c34',
  },
}));

export default CustomTooltip;
