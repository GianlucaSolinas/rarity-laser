import React, { useState, useEffect, useCallback } from 'react';
import {
  Chip,
  ClickAwayListener,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  LinearProgress,
  TablePagination,
  Stack,
  Button,
  Box,
  ListItem,
} from '@mui/material';
import { useMoralisQuery } from 'react-moralis';
import { format, formatDistance } from 'date-fns';
import TraitTableTooltip from './TraitTableTooltip';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import DiamondIcon from '@mui/icons-material/Diamond';
import { formatNumber, numberWithCommas } from '../hooks/utils';
import { grey, orange } from '@mui/material/colors';
import {
  CurrencyExchange,
  EmojiEvents,
  LocalFireDepartment,
  Poll,
} from '@mui/icons-material';

const getStatusRanked = (collection) => {
  if (!collection) {
    return 'Unranked';
  }

  switch (collection.status) {
    case 'running':
      return 'Running...';
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
    case 'failed':
      return 'Ranking calculation has failed, collection is incompatible.';

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

  const [isTraitTableOpen, setTraitTableOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [spotPrice, setSpotPrice] = useState(null);

  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const convertPrice = useCallback(async () => {
    setPriceLoading(true);
    const { data } = await (
      await fetch(`https://api.coinbase.com/v2/prices/ETH-${currency}/spot`)
    ).json();

    setPriceLoading(false);
    setSpotPrice(data.amount * price);
  }, [price]);

  useEffect(() => {
    if (price) {
      convertPrice();
    }
  }, [price, convertPrice]);

  const {
    data,
    error: fetchTokenError,
    isLoading,
  } = useMoralisQuery(
    'TokenRanked',
    (query) => query.equalTo({ contract_address: address, token_id: token_id }),
    [refresh]
  );

  let token = null;

  if (data && data.length) {
    const tokenString = JSON.stringify(data[0], null, 2);
    token = tokenString ? JSON.parse(tokenString) : null;
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
      <TraitTableTooltip
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
                    {token
                      ? `${token.rank || '---'} / ${
                          openSeaCollection.stats.count
                        }`
                      : getStatusRanked(collection)}
                  </Typography>
                </Stack>
              </Box>
              <Box component="ul">
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
            token ? `# ${token.rank || '---'}` : getStatusRanked(collection)
          }
        />
      </TraitTableTooltip>

      {token && (
        <TraitTableTooltip
          arrow
          open={isTraitTableOpen}
          title={
            <React.Fragment>
              <ClickAwayListener onClickAway={() => setTraitTableOpen(false)}>
                <TableContainer>
                  <Table
                    stickyHeader
                    className="RarityLaserTraitTable"
                    size="small"
                  >
                    <TableHead>
                      <TableRow variant="head">
                        <TableCell
                          style={{ color: 'white', fontWeight: 'bold' }}
                          align="center"
                        >
                          Trait
                        </TableCell>
                        <TableCell
                          style={{ color: 'white', fontWeight: 'bold' }}
                          align="center"
                        >
                          Score
                        </TableCell>
                        <TableCell
                          style={{ color: 'white', fontWeight: 'bold' }}
                          align="center"
                        >
                          Rarity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {token.attributes
                        .sort((a, b) => b.rarityScore - a.rarityScore)
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((el) => {
                          return (
                            <TableRow key={el.trait_type}>
                              <TableCell
                                align="center"
                                style={{ color: 'white' }}
                              >
                                <small
                                  style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    fontFamily: 'Lato',
                                    letterSpacing: '0.75px',
                                    opacity: 0.75,
                                  }}
                                >
                                  {el.trait_type}
                                </small>
                                <Typography>
                                  {el.value === null ? (
                                    <em style={{ opacity: 0.7 }}>
                                      No {el.trait_type}
                                    </em>
                                  ) : (
                                    el.value
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              >
                                {formatNumber(el.rarityScore, 'financial')}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              >
                                {`${formatNumber(
                                  // need to get back to percentage
                                  (1 / el.rarityScore) * 100,
                                  'financial'
                                )} %`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={token.attributes.length}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                    page={page}
                    onPageChange={handleChangePage}
                    style={{ color: 'white' }}
                  />
                </TableContainer>
              </ClickAwayListener>
            </React.Fragment>
          }
        >
          <Tooltip
            title={
              token
                ? `Traits score - click for details`
                : 'Traits score not available'
            }
          >
            <Chip
              variant="outlined"
              onClick={() => setTraitTableOpen((prev) => !prev)}
              icon={
                <LocalFireDepartment
                  sx={{ color: `${grey[500]} !important` }}
                />
              }
              label={token ? formatNumber(token.rarity, 'financial') : '---'}
            />
          </Tooltip>
        </TraitTableTooltip>
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
                `${numberWithCommas(formatNumber(spotPrice))} $`
              )
            }
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export default TokenRanked;
