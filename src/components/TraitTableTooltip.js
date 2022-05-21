import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const TraitTableTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#282c34',
    borderColor: '#282c34',
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

export default TraitTableTooltip;
