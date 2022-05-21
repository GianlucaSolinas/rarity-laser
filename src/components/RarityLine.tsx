import { Box, Stack, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
import React from 'react';

interface IProps {
  rarityPosition: number;
  totalTraitsPositions: number;
}

const RarityLine = ({ rarityPosition, totalTraitsPositions }: IProps) => {
  const positioning = (rarityPosition / totalTraitsPositions) * 100;

  const isSuperRare = positioning < 0;

  return (
    <Box mb={2} sx={{ position: 'relative' }}>
      <span
        style={{
          width: '5px',
          height: '15px',
          border: '1px solid black',
          background: isSuperRare ? 'gold' : 'white',
          position: 'absolute',
          top: '-5px',
          right: `${isSuperRare ? 0 : positioning}%`,
        }}
      ></span>
      <div
        style={{
          height: '5px',
          width: '100%',
          background: `linear-gradient(to right, rgba(255,255,255,0.2), ${orange[400]} ,${orange[800]})`,
        }}
      ></div>
      <Stack direction="row" justifyContent="space-between">
        <Typography padding="2px 4px" variant="caption">
          Common
        </Typography>
        <Typography
          padding="2px 4px"
          variant={isSuperRare ? 'body2' : 'caption'}
          color={isSuperRare ? 'primary' : 'white'}
          fontWeight={isSuperRare ? 'bold' : 'normal'}
        >
          {isSuperRare ? 'Super Rare' : 'Rare'}
        </Typography>
      </Stack>
    </Box>
  );
};

export default RarityLine;
