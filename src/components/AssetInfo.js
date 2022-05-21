import {
  LinearProgress,
  Alert,
  Button,
  Stack,
  Dialog,
  Paper,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { clearCollectionSub } from '../hooks/utils';
import { useMoralisCloudFunction } from 'react-moralis';

import TokenRanked from './TokenRanked';
import RankStatus from './RankStatus';
import HistoricalChartNFT from './charts/HistoricalChartNFT';
import { AllInclusive } from '@mui/icons-material';
import { orange } from '@mui/material/colors';
import RarityLine from './RarityLine';

const AssetInfo = ({
  address,
  token_id,
  collectionObject,
  type,
  openSeaCollection,
  rarityOverview,
}) => {
  const [error, setError] = useState(null);
  const [currentToast, setToast] = useState({ open: false, message: '' });
  const [dialogOpen, setDialogOpen] = useState(null);
  const [instantRarity, setInstantRarity] = useState(null);
  const [rarityPosition, setRarityPosition] = useState(null);

  const { collectionTotalTraits, rarestCombination, totalTraitsPositions } =
    rarityOverview;

  const {
    fetch: askSubscription,
    data: askSubscriptionData,
    error: askSubscriptionError,
    isLoading: askSubscriptionLoading,
  } = useMoralisCloudFunction('rankCollection', {}, { autoFetch: false });

  const fetchData = async () => {
    console.log('fething data');
    const { data, error } = await (
      await fetch(
        `https://api.covalenthq.com/v1/1/tokens/${address}/nft_metadata/${token_id}/?key=ckey_e53411317f40450b8b679520247`
      )
    ).json();

    const item = data.items[0];
    const nft_data = item.nft_data[0];
    const attributes = nft_data.external_data.attributes;

    const calculatedRarities = attributes.reduce(
      (acc, { trait_type, value, display_type }) => {
        const traitTotal = collectionTotalTraits[trait_type];
        if (traitTotal) {
          const formattedValue = String(value).toLowerCase();
          const percValue = (1 / traitTotal[formattedValue]) * 100;
          acc[trait_type] = {
            trait: formattedValue,
            value: 1 / percValue,
            position: rarestCombination[trait_type].findIndex((el) =>
              Object.hasOwn(el, formattedValue)
            ),
          };
        }

        return acc;
      },
      []
    );

    setInstantRarity(calculatedRarities);
    setRarityPosition(
      Object.values(calculatedRarities).reduce((acc, el) => {
        return acc + el.position;
      }, 0)
    );
  };

  useEffect(() => {
    if (token_id && address) {
      fetchData();
    }
  }, [token_id, address]);

  const requestSubscription = async () => {
    setToast({
      message:
        'Ranking process started! Please wait or come back later to view rankings.',
      open: true,
      severity: 'info',
    });

    const activationResult = await askSubscription({
      params: {
        opensea_name: openSeaCollection.name,
        opensea_slug: openSeaCollection.slug,
        payout_address: openSeaCollection.payout_address,
        address,
        // chain,
      },
    });

    if (activationResult) {
      setToast({
        message: 'Subscription activated!',
        open: true,
        severity: 'success',
      });
    } else {
      setToast({
        message: 'Cannot rank this collection.',
        open: true,
        severity: 'error',
      });
    }

    await clearCollectionSub(address);

    Array.from(
      document.querySelectorAll(`[data-waiting-sub="${address}"]`)
    ).forEach((elNode) => {
      elNode.dataset['shouldUpdate'] = true;
    });
  };

  const quickBidBuy = () => {
    window.postMessage({
      method: 'RarityLaserBidBuy',
      params: {
        // asset,
        // offers,
        tokenId: token_id,
        address: address,
        // price: massBid.price,
        // expirationTime: massBid.expirationTime,
      },
    });
  };

  return (
    <Paper
      style={{
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
      {askSubscriptionLoading && (
        <>
          <LinearProgress />
          <small>Calculating rarity...</small>
        </>
      )}

      {/* <div style={{ marginBottom: '8px' }}>
        {collectionObject ? (
          <RankStatus status={collectionObject.status} />
        ) : (
          <div
            onClick={() => {
              requestSubscription();
            }}
            style={{ cursor: 'pointer' }}
          >
            Subscribe to collection
          </div>
        )}
      </div> */}
      {rarityPosition !== null && (
        <Stack direction="column" gap={1}>
          <Typography variant="subtitle2">Rarity Laser</Typography>
          <RarityLine
            rarityPosition={rarityPosition}
            totalTraitsPositions={totalTraitsPositions}
          />
        </Stack>
      )}
      {/* <TokenRanked address={address} token_id={token_id} /> */}

      <Stack direction="row" justifyContent="center">
        <div>
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            item transactions history
          </Button>
        </div>
        <div>
          <Button variant="outlined" onClick={() => quickBidBuy()}>
            quick bid/buy
          </Button>
        </div>

        <Dialog
          open={dialogOpen}
          fullWidth
          maxWidth="lg"
          onClose={() => setDialogOpen(false)}
        >
          <HistoricalChartNFT address={address} token_id={token_id} />
        </Dialog>
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
