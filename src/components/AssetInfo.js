import {
  LinearProgress,
  Alert,
  Button,
  Stack,
  Dialog,
  Paper,
  Divider,
} from '@mui/material';
import React, { useState } from 'react';

import TokenRanked from './TokenRanked';
import HistoricalChartNFT from './charts/HistoricalChartNFT';
import { BarChart } from '@mui/icons-material';
// import RarityLine from './RarityLine';
import { SpyVolcanoIcon } from '../hooks/icons';
import { orange } from '@mui/material/colors';
import { fetchOpenSeaCollection } from '../hooks/collection';
import { useMutation } from 'react-query';
import { createRankedCollection } from '../queries/rankedCollection';

const AssetInfo = ({
  address,
  token_id,
  price,
  collectionObject,
  type,
  openSeaCollection,
  refresh,
}) => {
  const [error, setError] = useState(null);
  const [currentToast, setToast] = useState({ open: false, message: '' });
  const [dialogOpen, setDialogOpen] = useState(null);
  const splitLink = window.location.pathname.split('/');
  const isActivityTab = splitLink.pop() === 'activity';

  const { mutate, isLoading } = useMutation((newCollection) =>
    createRankedCollection(newCollection)
  );

  const requestCollectionRanking = async () => {
    setToast({
      message: `Ranking process started! Please come back later to view rankings.`,
      open: true,
      severity: 'info',
    });

    const splitLink = window.location.pathname.split('/');

    let OpenseaCollectionObject = null;

    if (splitLink[1] === 'collection') {
      OpenseaCollectionObject = await fetchOpenSeaCollection(splitLink[2]);

      if (OpenseaCollectionObject === null) {
        setToast({
          message: 'Something went wrong. Please try again later',
          open: true,
          severity: 'error',
        });
        return;
      }
    }

    // use OpenseaCollectionObject
    mutate(
      {
        name: OpenseaCollectionObject.name,
        opensea_slug: OpenseaCollectionObject.slug,
        contract_address: address,
        chain: 'ETH',
        items_count: OpenseaCollectionObject.stats.count,
      },
      {
        onError: (err) => {
          setToast({
            message: err.message,
            open: true,
            severity: 'error',
          });
        },
        onSuccess: async (res) => {
          setToast({
            message: `Ranking request completed! Please come back later to view the results.`,
            open: true,
            severity: 'success',
          });

          Array.from(
            document.querySelectorAll(`[data-waiting-sub="${address}"]`)
          ).forEach((elNode) => {
            elNode.dataset['shouldUpdate'] = true;
          });
        },
      }
    );
  };

  // const quickBidBuy = () => {
  //   window.postMessage({
  //     method: 'RarityLaserBidBuy',
  //     params: {
  //       // asset,
  //       // offers,
  //       tokenId: token_id,
  //       address: address,
  //       // price: massBid.price,
  //       // expirationTime: massBid.expirationTime,
  //     },
  //   });
  // };

  return (
    <Paper
      sx={{
        padding: '8px',
        ...(type === 'card_item'
          ? {
              borderTop: '1px solid #282c34',
              borderRadius: '0px 0px 5px 5px',
            }
          : {
              marginRight: '16px',
              borderRadius: '5px',
            }),
      }}
    >
      {isLoading && (
        <>
          <LinearProgress />
          <small>Loading...</small>
        </>
      )}

      <TokenRanked
        address={address}
        token_id={token_id}
        refresh={refresh}
        price={price}
        onRequestRank={requestCollectionRanking}
        openSeaCollection={openSeaCollection}
        collection={collectionObject}
      />

      <Divider
        variant="fullWidth"
        sx={{ borderColor: orange[500], margin: '0.5rem 0rem' }}
      />

      <Stack
        direction={isActivityTab ? 'column' : 'row'}
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{
          '&:hover': {
            paddingBottom: '30px',
            transition: 'padding-bottom 0.25s ease-in-out',
          },
        }}
      >
        <div>
          <Button
            startIcon={<BarChart />}
            variant="outlined"
            size="small"
            onClick={() => {
              setDialogOpen(true);
            }}
            sx={{
              zIndex: 39,
            }}
          >
            item history
          </Button>
        </div>
        {/* <div>
          <Button variant="outlined" onClick={() => quickBidBuy()}>
            quick bid/buy
          </Button>
        </div> */}

        <Dialog
          open={dialogOpen}
          fullWidth
          maxWidth="lg"
          onClose={() => setDialogOpen(false)}
        >
          <HistoricalChartNFT address={address} token_id={token_id} />
        </Dialog>

        <div style={{ width: '75px' }}>
          <SpyVolcanoIcon />
        </div>
      </Stack>

      {error && <small>!! {error} !!</small>}
      {currentToast.open && (
        <Alert
          onClose={() => {
            setToast({ open: false, message: '' });
          }}
          severity={currentToast.severity}
          sx={{ width: '100%' }}
        >
          {currentToast.message}
        </Alert>
      )}
    </Paper>
  );
};

export default AssetInfo;
