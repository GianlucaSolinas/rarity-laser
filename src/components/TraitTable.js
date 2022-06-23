import {
  ClickAwayListener,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { formatNumber } from '../hooks/utils';

const TraitTable = ({ token }) => {
  const [isTraitTableOpen, setTraitTableOpen] = useState(false);
  const [page, setPage] = useState(0);

  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <React.Fragment>
      <ClickAwayListener onClickAway={() => setTraitTableOpen(false)}>
        <TableContainer>
          <Table stickyHeader className="RarityLaserTraitTable" size="small">
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
                ? token.attributes
                    .sort((a, b) => b.rarity_score - a.rarity_score)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((el) => {
                      return (
                        <TableRow key={el.trait_type}>
                          <TableCell align="center" style={{ color: 'white' }}>
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
                              {el.trait_value === '__missing__' ? (
                                <em style={{ opacity: 0.7 }}>
                                  No {el.trait_type}
                                </em>
                              ) : (
                                el.trait_value
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
                            {formatNumber(el.rarity_score, 'financial')}
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
                              (1 / el.rarity_score) * 100,
                              'financial'
                            )} %`}
                          </TableCell>
                        </TableRow>
                      );
                    })
                : 'No data found.'}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={token.attributes ? token.attributes.length : 0}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            page={page}
            onPageChange={handleChangePage}
            style={{ color: 'white' }}
          />
        </TableContainer>
      </ClickAwayListener>
    </React.Fragment>
  );
};

export default TraitTable;
