import React, { useState } from 'react';

import { Button, Dialog, Divider, Stack } from '@mui/material';

import TwitterInfo from './stats/TwitterInfo';
import DiscordInfo from './stats/DiscordInfo';
import FloorPriceAnalysis from './stats/FloorPriceAnalysis';
import HistoricalChart from './charts/HistoricalChart';
import OwnersWrapper from './stats/TopTenOwners';

const CollectionStats = ({ collectionObject }) => {
  const hasTwitter = document.querySelector(
    'a[href*="https://www.twitter.com/"]'
  );
  const hasDiscord = document.querySelector('a[href*="https://discord.gg/"]');
  const hasEtherscan = document.querySelector('a[href*="etherscan.io"]');
  const [dialogOpen, setDialogOpen] = useState(null);

  // const copyToClipboard = (addr) => {
  //   navigator.clipboard.writeText(addr);
  // };
  const covalentLogo = chrome.runtime.getURL('covalent.svg');

  return (
    <Stack
      className="RarityLaser--CollectionStats"
      direction="column"
      gap={2}
      mt={2}
      divider={<Divider />}
    >
      <Stack
        direction="row"
        gap={1}
        justifyContent="space-evenly"
        textAlign="center"
      >
        {/* twitter */}
        {hasTwitter && (
          <TwitterInfo twitterLink={hasTwitter.getAttribute('href')} />
        )}
        {/* discord */}
        {hasDiscord && (
          <DiscordInfo discordUrl={hasDiscord.getAttribute('href')} />
        )}
        <FloorPriceAnalysis />
        {hasEtherscan && (
          <OwnersWrapper
            etherscanAddress={hasEtherscan.getAttribute('href')}
            payout_address={collectionObject.payout_address}
            floor_price={collectionObject.stats.floor_price}
          />
        )}
      </Stack>

      {/* <Stack direction="row" justifyContent="center">
        <div>
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            Analyze historical price
          </Button>
        </div>

        <Dialog
          open={dialogOpen}
          fullWidth
          maxWidth="lg"
          onClose={() => setDialogOpen(false)}
        >
          <HistoricalChart collectionObject={collectionObject} />
        </Dialog>
      </Stack> */}
    </Stack>
  );
};

export default CollectionStats;
