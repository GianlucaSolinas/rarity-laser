import React, { useState, useEffect, useCallback } from 'react';
import {
  Chip,
  Tooltip,
  Typography,
  CircularProgress,
  LinearProgress,
  Stack,
  Button,
  Box,
  ListItem,
} from '@mui/material';
import { format, formatDistance } from 'date-fns';
import CustomTooltip from './CustomTooltip';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import { formatNumber, numberWithCommas } from '../hooks/utils';
import { grey } from '@mui/material/colors';
import {
  CurrencyExchange,
  EmojiEvents,
  LocalFireDepartment,
  Pending,
  Poll,
  Replay,
} from '@mui/icons-material';
import TraitTable from './TraitTable';
import ky from 'ky';
import { useMutation, useQuery } from 'react-query';
import { fetchSingleToken, requestSyncMetadata } from '../queries/token';

const getStatusRanked = (collection) => {
  if (!collection) {
    return 'Unranked';
  }

  switch (collection.status) {
    case 'running':
      return 'In progress...';
    case 'queue':
      return 'Queued';
    case 'failed':
      return 'Ranking failed';
    case 'ranked':
      return 'Not available';

    default:
      return 'Unranked';
  }
};
const getStatusRankedMessage = (collection) => {
  if (!collection) {
    return 'Unranked';
  }

  switch (collection.status) {
    case 'running':
      return 'Ranking calculation is running, please come back later to view the results';
    case 'queue':
      return 'Some other ranking calculation is running. Your request will be handled as soon as previous requests are complete.';
    case 'failed':
      return 'Ranking calculation has failed during the process.';
    case 'unranked':
      return 'Unranked';

    default:
      return 'Ranking for this item is not available.';
  }
};

const TokenRanked = ({
  address,
  token_id,
  refresh,
  price,
  onRequestRank,
  openSeaCollection,
  collection,
}) => {
  const splitLink = window.location.pathname.split('/');
  const isActivityTab = splitLink.pop() === 'activity';

  const [currency, setCurrency] = useState('USD');

  const [priceLoading, setPriceLoading] = useState(false);
  const [spotPrice, setSpotPrice] = useState(null);

  const convertPrice = useCallback(async () => {
    setPriceLoading(true);
    const { data } = await ky
      .get(`https://api.coinbase.com/v2/prices/ETH-${currency}/spot`)
      .json();

    setPriceLoading(false);
    setSpotPrice(data.amount * price);
  }, [price]);

  useEffect(() => {
    if (price) {
      convertPrice();
    }
  }, [price, convertPrice]);

  const { data, error, isLoading } = useQuery(
    ['getSingleToken', { address, token_id }],
    fetchSingleToken
  );

  const { mutate } = useMutation(
    () => {
      return requestSyncMetadata({
        contract_address: address,
        opensea_slug: openSeaCollection.slug,
        chain: 'ETH',
      });
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          Array.from(
            document.querySelectorAll(`[data-waiting-sub="${address}"]`)
          ).forEach((elNode) => {
            elNode.dataset['shouldUpdate'] = true;
          });
        }, 5000);
      },
      onError: () => {
        console.log('error');
      },
    }
  );

  const sendRetryRanking = () => {
    mutate();
  };

  let token = null;

  if (data) {
    token = data;
  }

  if (isLoading) {
    return (
      <>
        <LinearProgress />
        <small>Loading...</small>
      </>
    );
  }

  return (
    <Stack
      direction={isActivityTab ? 'column' : 'row'}
      gap={1}
      flexWrap="wrap"
      justifyContent="start"
    >
      <CustomTooltip
        title={
          token ? (
            <Stack>
              <Box>
                <Stack direction="row" alignItems="center">
                  <EmojiEvents
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: '1rem' }}
                  />
                  <Typography variant="h5" color="primary">
                    {token && token.rank
                      ? `${token.rank || '---'} / ${
                          openSeaCollection.stats.count
                        }`
                      : getStatusRanked(collection)}
                  </Typography>
                </Stack>
              </Box>
              <Box component="ul">
                {collection.status === 'failed' && (
                  <ListItem>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Replay />}
                      onClick={() => sendRetryRanking()}
                    >
                      Retry
                    </Button>
                  </ListItem>
                )}
                {collection.status === 'running' && (
                  <ListItem>
                    <Pending
                      fontSize="small"
                      color="secondary"
                      sx={{
                        marginRight: '0.5rem',
                      }}
                    />
                    {`Metadata and ranking calculation in progress.`}
                  </ListItem>
                )}
                {token.rank && (
                  <ListItem>
                    <StarIcon
                      fontSize="small"
                      color="secondary"
                      sx={{
                        marginRight: '0.5rem',
                      }}
                    />
                    {`Ranked ${formatDistance(
                      new Date(token.updatedAt),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )} (${format(
                      new Date(token.updatedAt),
                      'dd MMM yyyy HH:mm'
                    )})`}
                  </ListItem>
                )}
                {token.last_metadata_sync && (
                  <ListItem>
                    <DiamondIcon
                      fontSize="small"
                      color="secondary"
                      sx={{ marginRight: '0.5rem' }}
                    />
                    {`Traits synced ${formatDistance(
                      new Date(token.last_metadata_sync),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )} (${format(
                      new Date(token.last_metadata_sync),
                      'dd MMM yyyy HH:mm'
                    )})`}
                  </ListItem>
                )}
              </Box>
            </Stack>
          ) : collection ? (
            <Typography variant="caption">
              {getStatusRankedMessage(collection)}
            </Typography>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                onRequestRank();
              }}
              startIcon={<Poll />}
            >
              Request ranking
            </Button>
          )
        }
      >
        <Chip
          variant="outlined"
          icon={<EmojiEvents sx={{ color: `${grey[500]} !important` }} />}
          label={
            token && token.rank
              ? `# ${token.rank || '---'}`
              : getStatusRanked(collection)
          }
        />
      </CustomTooltip>

      {token && (
        <CustomTooltip
          arrow
          title={<TraitTable token={token} />}
          leaveDelay={750}
        >
          <Chip
            variant="outlined"
            icon={
              <LocalFireDepartment sx={{ color: `${grey[500]} !important` }} />
            }
            label={token ? formatNumber(token.rarity, 'financial') : '---'}
          />
        </CustomTooltip>
      )}

      {!isActivityTab && (
        <Tooltip
          title={`Price in ${currency} at ${format(
            new Date(),
            'dd MMM yyyy HH:mm'
          )}`}
        >
          <Chip
            variant="outlined"
            icon={
              <CurrencyExchange sx={{ color: `${grey[500]} !important` }} />
            }
            label={
              priceLoading ? (
                <CircularProgress size="1rem" />
              ) : (
                `${numberWithCommas(formatNumber(spotPrice, 'integer'))} $`
              )
            }
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export default TokenRanked;
