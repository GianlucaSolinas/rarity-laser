import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
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
  const [totalItems, setTotalItems] = useState(0);

  const calculate = async () => {
    setActive(true);
    setProgress((el) => ({ ...el, loading: true }));
    // Fetch the current (profile) page as text
    const serverRender = await fetch(
      window.location.href.split(/[?#]/)[0]
    ).then((res) => res.text());
    // Parse out the full address based on the shortened version
    const address = (serverRender.match(
      new RegExp(`${shortenedAddress.replace('...', '[a-z0-9]+?')}`, 'i')
    ) || [])[0];

    if (!address) return;

    const collections = await fetchAllCollectionsForUser(address);

    await Promise.all(
      collections.map(async ({ slug, name, image, ownedCount }) => {
        const floor = await fetchFloorPrice(slug);
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

  return (
    <Paper sx={{ textAlign: 'center', padding: '16px', marginTop: '16px' }}>
      <Stack gap={2} direction="column">
        <Box>
          <Button
            disabled={progress.loading || active}
            size="small"
            variant="contained"
            onClick={calculate}
          >
            Calculate profile value
          </Button>
        </Box>
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
        {active && (
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
                Floor total
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
                      formatNumber(floorTotal / progress.numLoaded)
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
            {/* <ul>
            {collectionsBreakdown.map((coll) => {
              return <div>{coll.name}</div>;
            })}
          </ul> */}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default ProfileInfo;
