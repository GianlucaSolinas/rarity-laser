import { TableView } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useState } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { EthIcon } from '../hooks/icons';
import {
  fetchAllCollectionsForUser,
  fetchFloorPrice,
  formatNumber,
  numberWithCommas,
} from '../hooks/utils';
import _ from 'lodash';

const ProfileInfo = ({ shortenedAddress }) => {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    numLoaded: 0,
    current: 0,
    complete: false,
    loading: false,
  });
  const [collectionsBreakdown, setCollections] = useState([]);
  const [floorTotal, setFloorTotal] = useState(0);
  const [floorTotalUnique, setFloorTotalUnique] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showBreakdownDialog, setShowBreakdownDialog] = useState(false);

  const calculate = async () => {
    setActive(true);
    setProgress((el) => ({ ...el, loading: true }));
    // Fetch the current (profile) page as text
    const serverRender = await fetch(
      window.location.href.split(/[?#]/)[0]
    ).then((res) => res.text());
    // Parse out the full address based on the shortened version

    const html = document.createElement('html');
    html.innerHTML = serverRender;
    const nextData = JSON.parse(
      html.querySelector('script#__NEXT_DATA__')?.innerHTML || '{}'
    );

    const address = _.get(nextData, 'props.ssrData.account.address');

    if (!address) return;

    // const res = await (
    //   await fetch(
    //     `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?key=ckey_e53411317f40450b8b679520247`
    //   )
    // ).json();

    // console.log('res balance', res);
    const collections = await fetchAllCollectionsForUser(address);
    await Promise.all(
      collections.map(async ({ slug, name, image, ownedCount }) => {
        const floor = await fetchFloorPrice(slug);
        setFloorTotalUnique((total) => total + floor.price);
        setFloorTotal((total) => total + floor.price * ownedCount);
        setTotalItems((prev) => prev + ownedCount);
        setCollections((floorBreakdown) => [
          ...floorBreakdown,
          { name, slug, image, floor: floor.price, ownedCount },
        ]);
        setProgress(({ numLoaded, total }) => ({
          total: collections.length,
          numLoaded: numLoaded + 1,
          complete: numLoaded + 1 >= collections.length,
          loading: !(numLoaded + 1 >= collections.length),
          current: total
            ? formatNumber((numLoaded / total) * 100, 'integer')
            : 0,
        }));
      })
    );
  };

  const logo = chrome.runtime.getURL('Spy-icon-orange.png');

  return (
    <Paper
      sx={{
        textAlign: 'center',
        padding: '16px',
        marginTop: '16px',
        backgroundImage: `url(${logo})`,
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100px',
        backgroundOrigin: 'content-box',
      }}
    >
      <div
        style={{
          width: '80%',
        }}
      >
        <Stack gap={2} direction="column">
          {progress.loading && (
            <Stack
              direction="column"
              gap={1}
              justifyContent="center"
              textAlign="center"
            >
              <LinearProgress variant="determinate" value={progress.current} />
              <Typography
                variant="body2"
                color="secondary"
              >{`${progress.current}%`}</Typography>
            </Stack>
          )}
          {active ? (
            <Stack
              direction="row"
              gap={2}
              justifyContent="space-around"
              textAlign="center"
            >
              <Box>
                <Typography
                  color="secondary"
                  variant="subtitle1"
                  fontFamily="Poppins"
                >
                  Total floor
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  <EthIcon />
                  {progress.numLoaded
                    ? numberWithCommas(formatNumber(floorTotal))
                    : '---'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  color="secondary"
                  variant="subtitle1"
                  fontFamily="Poppins"
                >
                  Average floor
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  <EthIcon />
                  {progress.numLoaded
                    ? numberWithCommas(
                        formatNumber(floorTotalUnique / progress.numLoaded)
                      )
                    : '---'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  color="secondary"
                  variant="subtitle1"
                  fontFamily="Poppins"
                >
                  Collections
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  {progress.numLoaded
                    ? numberWithCommas(formatNumber(progress.numLoaded))
                    : '---'}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" paddingTop={2} paddingBottom={2}>
              <Button size="small" variant="contained" onClick={calculate}>
                Calculate profile value
              </Button>
            </Stack>
          )}

          {progress.complete && (
            <Stack direction="row">
              <Button
                startIcon={<TableView />}
                variant="contained"
                onClick={() => {
                  setShowBreakdownDialog(true);
                }}
              >
                Show breakdown
              </Button>
            </Stack>
          )}

          <Dialog
            open={showBreakdownDialog}
            onClose={() => {
              setShowBreakdownDialog(false);
            }}
            fullWidth={true}
            maxWidth="md"
          >
            <DialogTitle>Collections breakdown</DialogTitle>
            <DialogContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableCell>Collection</TableCell>
                    <TableCell>Floor price</TableCell>
                    <TableCell>Owned</TableCell>
                    <TableCell>Total floor</TableCell>
                  </TableHead>
                  <TableBody>
                    {collectionsBreakdown
                      .sort((a, b) => b.ownedCount - a.ownedCount)
                      .map((coll) => {
                        //name, slug, image, floor: floor.price, ownedCount
                        return (
                          <TableRow>
                            <TableCell>
                              <Chip
                                variant="outlined"
                                component="a"
                                clickable
                                target="_blank"
                                href={`https://opensea.io/collection/${coll.slug}`}
                                avatar={
                                  <Avatar alt={coll.name} src={coll.image} />
                                }
                                label={coll.name}
                              >
                                {coll.name}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <EthIcon /> {coll.floor}
                            </TableCell>
                            <TableCell>x{coll.ownedCount}</TableCell>
                            <TableCell>
                              <EthIcon />
                              {numberWithCommas(
                                formatNumber(coll.ownedCount * coll.floor)
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </Stack>
      </div>
    </Paper>
  );
};

export default ProfileInfo;
