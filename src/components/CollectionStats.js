import React, { useEffect, useState } from 'react';
import { useMoralisCloudFunction, useMoralisQuery } from 'react-moralis';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import {
  abbrevNumber,
  formatNumber,
  numberWithCommas,
  shortenAddress,
} from '../hooks/utils';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import Moralis from 'moralis';
import {
  Copyright,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
  Verified,
} from '@mui/icons-material';
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from 'date-fns';
import TwitterInfo from './stats/TwitterInfo';
import DiscordInfo from './stats/DiscordInfo';
import FloorPriceAnalysis from './stats/FloorPriceAnalysis';
import HistoricalChart from './charts/HistoricalChart';
import { EthIcon, WhaleIcon } from '../hooks/icons';

const TopTenOwners = ({
  collectionData,
  onCollectionSuccess,
  contract_address,
  payout_address,
}) => {
  const owners = collectionData ? collectionData.top_ten_owners : [];
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading: ownersLoading } = useMoralisQuery(
    'Owners',
    (query) =>
      query.containedIn(
        'address',
        owners.map((e) => e.address)
      ),
    [collectionData]
  );

  const {
    fetch,
    isLoading: cloudFunctionLoading,
    isFetching,
  } = useMoralisCloudFunction(
    'getWhales',
    {
      address: contract_address,
    },
    { autoFetch: false }
  );

  let ownersData = null;
  let whalesCount = 0;

  if (data && data.length) {
    const ownersDataString = JSON.stringify(data, null, 2);
    ownersData = ownersDataString ? JSON.parse(ownersDataString) : null;

    if (ownersData) {
      ownersData = ownersData
        .map((e) => {
          let isWhale = false;
          let thisowner = owners.find((ow) => ow.address === e.address);

          const balance = Moralis.Units.FromWei(e.balance);
          const ethBalance = formatNumber(balance);

          if (ethBalance > 100) {
            isWhale = true;
            whalesCount++;
          }

          return {
            ...thisowner,
            ...e,
            isWhale,
          };
        })
        .sort((a, b) => b.amount - a.amount);
    }
  }

  const isLoading = cloudFunctionLoading || isFetching || ownersLoading;
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
      <Typography variant="subtitle2">Whales in Top 10 owners</Typography>

      <Box textAlign="center" marginTop="8px">
        <Stack direction="column" gap={1}>
          {ownersData ? (
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Show Top 10
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={() =>
                fetch({
                  onSuccess: () => {
                    onCollectionSuccess();
                  },
                })
              }
            >
              {isLoading ? 'Fetching...' : 'Fetch top 10'}
            </Button>
          )}
          {collectionData && (
            <Typography variant="caption" fontStyle="italic">
              {`Synced ${formatDistanceToNow(
                new Date(collectionData.updatedAt),
                {
                  addSuffix: true,
                }
              )}`}
            </Typography>
          )}
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
                <TableCell align="left">Rank</TableCell>
                <TableCell align="center">Items owned</TableCell>
                <TableCell align="left">Profile</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="center">Badges</TableCell>
              </TableHead>
              <TableBody>
                {ownersData.map((el, index) => {
                  const balance = Moralis.Units.FromWei(el.balance);
                  const ethBalance = formatNumber(balance);

                  const hasOpenseaAccount = !!el.openseaAccount;

                  const isWhale = ethBalance > 100;
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
                          {el.amount}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Tooltip title="Go to profile">
                          <Chip
                            variant="outlined"
                            component="a"
                            clickable
                            target="_blank"
                            href={`https://opensea.io/${el.address}`}
                            avatar={
                              <Avatar
                                alt={username}
                                src={
                                  hasOpenseaAccount
                                    ? el.openseaAccount.account.profile_img_url
                                    : null
                                }
                              />
                            }
                            label={username}
                          >
                            {username}
                          </Chip>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={balance}>
                          <Typography variant="body1" fontWeight="bold">
                            <EthIcon /> {ethBalance}
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
                            <Tooltip title="This address holds more than 100 ETH">
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

const OwnersWrapper = ({ etherscanAddress, payout_address }) => {
  const splitLink = etherscanAddress.split('/');
  const contract_address = splitLink.pop();

  const { data: visitedCollection, fetch: fetchCollection } = useMoralisQuery(
    'VisitedCollection',
    (query) => query.equalTo('address', contract_address)
  );

  let collectionData = null;

  if (visitedCollection && visitedCollection.length) {
    const collectionDataString = JSON.stringify(visitedCollection[0], null, 2);
    collectionData = collectionDataString
      ? JSON.parse(collectionDataString)
      : null;
  }

  return (
    <React.Fragment>
      <TopTenOwners
        contract_address={contract_address}
        payout_address={payout_address}
        collectionData={collectionData}
        onCollectionSuccess={() => {
          fetchCollection();
        }}
      />
    </React.Fragment>
  );
};

const CollectionStats = ({ collectionObject }) => {
  const hasTwitter = document.querySelector('a[href*="https://twitter.com/"]');
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
        <FloorPriceAnalysis collectionObject={collectionObject} />
        {hasEtherscan && (
          <OwnersWrapper
            etherscanAddress={hasEtherscan.getAttribute('href')}
            payout_address={collectionObject.payout_address}
          />
        )}
      </Stack>

      <Stack direction="row" justifyContent="center">
        <div>
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            collection historical data
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
      </Stack>
    </Stack>
  );
};

export default CollectionStats;
