import React, { useState } from 'react';
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
  LinearProgress,
  TablePagination,
} from '@mui/material';
import { useMoralisQuery } from 'react-moralis';
import { format, formatDistance } from 'date-fns';
import TraitTableTooltip from './TraitTableTooltip';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import DiamondIcon from '@mui/icons-material/Diamond';
import { formatNumber } from '../hooks/utils';

const TokenRanked = ({ address, token_id }) => {
  const params = new URL(window.document.location).searchParams;
  const isActivityTab = params.get('tab') === 'activity';

  const [isTraitTableOpen, setTraitTableOpen] = useState(false);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const {
    data,
    error: fetchTokenError,
    isLoading,
  } = useMoralisQuery('TokenRanked', (query) =>
    query.equalTo({ contract_address: address, token_id: token_id })
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
        <small>Server loading...</small>
      </>
    );
  }

  if (!token) {
    return '';
  }

  return (
    <Typography variant="p">
      <Tooltip
        title={
          token ? (
            <div>
              {`Ranked ${formatDistance(new Date(token.updatedAt), new Date(), {
                addSuffix: true,
              })} (${format(new Date(token.updatedAt), 'dd MMM yyyy HH:mm')})`}
            </div>
          ) : (
            'Click to request ranking - Members only'
          )
        }
      >
        <Typography fontWeight="bolder" variant="body1">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isActivityTab ? (
              <StarIcon style={{ color: 'gold', marginRight: '4px' }} />
            ) : (
              <small style={{ marginRight: '4px' }}>Rank:</small>
            )}
            {isLoading && 'Loading rank...'}
            {token && `#${token.rank}`}
            {!isLoading && token === null && <div>To be ranked</div>}
          </div>
        </Typography>
      </Tooltip>
      <Typography fontWeight="bolder" variant="body1">
        <Tooltip
          title={`Traits synced ${formatDistance(
            new Date(token.synced_at),
            new Date(),
            {
              addSuffix: true,
            }
          )} (${format(new Date(token.synced_at), 'dd MMM yyyy HH:mm')})`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isActivityTab ? (
              <TimelineIcon style={{ color: 'gold', marginRight: '4px' }} />
            ) : (
              <small style={{ marginRight: '4px' }}>Total Traits Score:</small>
            )}
            {formatNumber(token.rarity, 'financial')}
          </div>
        </Tooltip>
      </Typography>
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
                                  fontSize: '10px',
                                  letterSpacing: '0.5px',
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
        <Chip
          style={{
            color: 'white',
            fontWeight: 'bold',
            zIndex: 999,
            ...(isTraitTableOpen && {
              background: '#00D7E2',
              color: '#282c34',
            }),
            '&:hover': {
              borderColor: '#00D7E2',
              opacity: 0.5,
            },
          }}
          variant={isTraitTableOpen ? 'outlined' : 'normal'}
          icon={<DiamondIcon />}
          label={`${token.attributes.length} TRAITS`}
          onClick={() => {
            setTraitTableOpen((prev) => !prev);
          }}
        ></Chip>
      </TraitTableTooltip>
    </Typography>
  );
};

export default TokenRanked;
