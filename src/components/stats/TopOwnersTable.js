import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Fade,
  keyframes,
  List,
  ListItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  checkWhale,
  fetchFloorPrice,
  formatNumber,
  numberWithCommas,
  shortenAddress,
} from '../../hooks/utils';
import { formatDistanceToNow } from 'date-fns';
import { Copyright, Refresh, Verified } from '@mui/icons-material';
import { EthIcon, WhaleIcon } from '../../hooks/icons';
import { useQuery } from 'react-query';
import { fetchTopTenOwners } from '../../queries/trend';
import ky from 'ky';
import { RateLimit } from 'async-sema';
import { useInView } from 'react-intersection-observer';

const openSeaPublicRateLimit = RateLimit(2);

const OpenseaProfileChipLoader = ({ username, address, index }) => {
  const { ref, inView } = useInView({ threshold: 1, delay: 2500 });

  const { data: openseaProfile, refetch } = useQuery(
    ['fetchOpenseaUser', address],
    async () => {
      await openSeaPublicRateLimit();
      const data = await ky.get(`https://api.opensea.io/user/${address}`);
      return data.json();
    },
    { enabled: false, retry: false }
  );

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView, refetch]);

  const updatedUsername = openseaProfile?.username || username;

  return (
    <div ref={ref}>
      <Stack alignItems="center" direction="row" gap={1}>
        <Chip
          variant="outlined"
          component="a"
          clickable
          target="_blank"
          href={`https://opensea.io/${openseaProfile?.username || address}`}
          avatar={
            <Avatar
              alt={updatedUsername}
              src={
                openseaProfile ? openseaProfile.account.profile_img_url : null
              }
            />
          }
          label={<>{updatedUsername} </>}
        ></Chip>
        {openseaProfile ? (
          ''
        ) : inView ? (
          <CircularProgress size={20} color="primary" thickness={3} />
        ) : (
          ''
        )}
      </Stack>
    </div>
  );
};

const TopOwnersTable = ({
  collectionData,
  onCollectionSuccess,
  contract_address,
  payout_address,
  floor_price = 0,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['fetchTopTenOwners', { contract_address }],
    fetchTopTenOwners
  );

  let ownersData = null;
  let whalesCount = 0;

  if (data && data.items.length) {
    ownersData = data.items.map((el) => {
      const total_floor = el.balance * floor_price;
      const isWhale = checkWhale({ ...el, total_floor });

      if (isWhale) {
        whalesCount++;
      }

      return { ...el, total_floor };
    });
  }

  // const covalentLogo = chrome.runtime.getURL('solana.svg');

  return (
    <Paper
      elevation={1}
      style={{
        minWidth: '10vw',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <WhaleIcon
          htmlColor="white"
          viewBox="0 0 30 30"
          style={{ width: '25px', height: '25px' }}
        />
        <Typography fontWeight="bold" variant="h6">
          {isLoading ? (
            <Skeleton sx={{ bgcolor: 'grey.400' }} width={50} />
          ) : ownersData ? (
            whalesCount
          ) : (
            '---'
          )}
        </Typography>
      </Stack>
      <Typography variant="subtitle2">Whales in Top 100 owners</Typography>

      <Box textAlign="center" marginTop="8px">
        <Stack direction="column" gap={1}>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setModalOpen(true);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading' : 'Show Top 100'}
          </Button>
        </Stack>
      </Box>
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth={true}
        maxWidth="sm"
      >
        {ownersData && (
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableCell variant="head" align="left">
                  Rank
                </TableCell>
                <TableCell variant="head" align="center">
                  Items owned
                </TableCell>
                <TableCell variant="head" align="left">
                  Profile / address
                </TableCell>
                <TableCell variant="head" align="right">
                  Total floor
                </TableCell>
                <TableCell variant="head" align="center">
                  Badges
                </TableCell>
              </TableHead>
              <TableBody>
                {ownersData.map((el, index) => {
                  const hasOpenseaAccount = !!el.openseaAccount;

                  const isWhale = checkWhale(el);
                  const isVerified = hasOpenseaAccount
                    ? el.openseaAccount.account.config === 'verified'
                    : false;
                  const isCreator = payout_address === el.address;

                  const username =
                    (hasOpenseaAccount && el.openseaAccount.username) ||
                    shortenAddress(el.address);

                  return (
                    <TableRow key={el.address}>
                      <TableCell align="left">
                        <Typography variant="body1" fontWeight="bold">{`# ${
                          index + 1
                        }`}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight="bold">
                          {el.balance}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Tooltip title="Go to profile">
                          <OpenseaProfileChipLoader
                            address={el.address}
                            username={username}
                            index={index}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={numberWithCommas(el.total_floor)}>
                          <Typography variant="body1" fontWeight="bold">
                            <EthIcon />{' '}
                            {numberWithCommas(
                              formatNumber(el.total_floor, 'financial')
                            )}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          gap={0.5}
                        >
                          {isVerified && (
                            <Tooltip title="Verified user on OpenSea">
                              <div style={{ margin: '4px' }}>
                                <Verified />
                              </div>
                            </Tooltip>
                          )}
                          {isWhale && (
                            <Tooltip
                              title={
                                <List
                                  subheader={`Conditions required to be considered "whale":`}
                                >
                                  <ListItem>
                                    Total floor (floor price * items owned) is
                                    more than 1000 ETH
                                  </ListItem>
                                  <ListItem>
                                    Items owned are more than 10% of the total
                                    supply
                                  </ListItem>
                                </List>
                              }
                            >
                              <div style={{ margin: '4px' }}>
                                <WhaleIcon viewBox="0 0 30 30" />
                              </div>
                            </Tooltip>
                          )}
                          {isCreator && (
                            <Tooltip title="This user is the collection creator">
                              <div style={{ margin: '4px' }}>
                                <Copyright />
                              </div>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Dialog>
    </Paper>
  );
};

const OwnersWrapper = ({ etherscanAddress, payout_address, floor_price }) => {
  const splitLink = etherscanAddress.split('/');
  const contract_address = splitLink.pop();

  return (
    <React.Fragment>
      <TopOwnersTable
        contract_address={contract_address}
        payout_address={payout_address}
        floor_price={floor_price}
      />
    </React.Fragment>
  );
};

export default OwnersWrapper;
