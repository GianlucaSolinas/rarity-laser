import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

import Moralis from 'moralis';
import chroma from 'chroma-js';
import React, { useEffect, useRef, useState } from 'react';
import { format, sub } from 'date-fns';
import { orange } from '@mui/material/colors';
import { shortenAddress } from '../../hooks/utils';
import ky from 'ky';
import web3 from 'web3';

Chart.register(annotationPlugin);

const contentEventMapping = {
  mint: { content: 'Mint', color: '#39FF14' },
  sale: { content: ['Sale', '$'], color: '#FFD1D1' },
  transfer: { content: ['Transfer', '⇌'], color: '#DBDBFF' },
};

const HistoricalChartNFT = ({ address, token_id }) => {
  const [chartInstance, setChartInstance] = useState(null);
  const [loading, setLoading] = useState(null);
  const [datahistory, setDataHistory] = useState(null);
  const canvasRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await ky
      .get(
        `https://api.covalenthq.com/v1/1/tokens/${address}/nft_transactions/${token_id}/?&quote-currency=EUR&format=JSON&key=ckey_e53411317f40450b8b679520247`
      )
      .json();

    if (error) {
      console.log(error);
      setLoading(false);
    } else {
      setDataHistory(data.items);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && token_id) {
      fetchData();
    }
  }, [address, token_id]);

  const getDatasets = () => {
    const valueDatasets = datahistory.map((el) => {
      return {
        label: 'Price',
        type: 'bar',
        data: el.nft_transactions
          .filter((e) => e.vale !== '0')
          .map((e) => ({
            x: new Date(e.block_signed_at).getTime(),
            y: web3.utils.fromWei(e.value),
          })),
        color: '#DBDBDB',
        borderColor: '#DBDBDB',
        backgroundColor: '#DBDBDB',
      };
    });

    const feesDatasets = datahistory.map((el) => {
      return {
        label: `Fees paid`,
        type: 'bar',
        data: el.nft_transactions.map((e) => ({
          x: new Date(e.block_signed_at).getTime(),
          y: e.fees_paid ? web3.utils.fromWei(e.fees_paid) : 0,
        })),
        color: orange[800],
        borderColor: orange[800],
        backgroundColor: orange[800],
      };
    });

    return valueDatasets.concat(feesDatasets);
  };

  const getGradient = (ctx, chartArea, color) => {
    const gradientBg = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );

    const scale = chroma.scale([color, '#4a4e54']);
    [0, 0.5, 1].forEach((e) => {
      gradientBg.addColorStop(e, scale(e).alpha(0.7).css());
    });

    return gradientBg;
  };

  useEffect(() => {
    if (datahistory) {
      if (chartInstance) {
        chartInstance.data.datasets = getDatasets();
        chartInstance.update();
        return;
      }

      const allTransactions = datahistory.reduce((acc, el) => {
        return acc.concat(el.nft_transactions.reverse());
      }, []);

      const ANNOTATIONS = allTransactions.reduce((acc, el, index) => {
        let type = el.value === '0' ? 'transfer' : 'sale';

        if (index === 0) {
          type = 'mint';
        }

        const mappedEvent = contentEventMapping[type];

        acc[el.tx_hash] = {
          type: 'line',
          drawTime: 'afterDatasetsDraw',
          scaleID: 'x',
          value: new Date(el.block_signed_at).getTime(),
          textAlign: 'center',
          borderWidth: 0.5,
          borderDash: [6, 4],
          borderColor: mappedEvent.color,
          // chroma('#39FF14').alpha(0.5).css(),
          backgroundColor: mappedEvent.color,
          label: {
            enabled: true,
            content: mappedEvent.content,
            backgroundColor: mappedEvent.color,
            color: 'black',
            position: 'start',
            font: {
              family: 'Lato',
              weight: 'normal',
            },
          },
          click() {
            window.open(`https://etherscan.io/tx/${el.tx_hash}`, '_blank');
          },
          enter({ chart, element }, event) {
            chart.canvas.style.cursor = 'pointer';
          },
          leave({ chart, element }, event) {
            chart.canvas.style.cursor = 'default';
          },
        };

        return acc;
      }, {});

      const annotationLength = Object.keys(ANNOTATIONS).length;

      const optionsObject = {
        type: 'bar',
        data: {
          datasets: getDatasets(),
        },
        plugins: [
          {
            id: 'afterDrawPlugin_nft',
            afterDraw: (chart) => {
              // if there is no data, show text on background
              if (chart.data.datasets[0].data.length === 0) {
                var ctx = chart.ctx;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '27px Open Sans';
                ctx.fillStyle = 'gray';
                let centerX = chart.width / 2;
                let centerY = chart.height / 3;
                ctx.fillText('NO DATA AVAILABLE', centerX, centerY);
                ctx.font = '24px Open Sans';
                ctx.fillText(
                  'Please refine the date range',
                  centerX,
                  centerY + centerY / 2
                );
                ctx.restore();
              }

              // show vertical line on cursor
              // if (chart.tooltip?._active.length) {
              //   let x = chart.tooltip._active[0].element.x;
              //   let yAxis = chart.scales.y;
              //   let ctx = chart.ctx;
              //   ctx.save();
              //   ctx.setLineDash([5, 3]);
              //   ctx.beginPath();
              //   ctx.moveTo(x, yAxis.top);
              //   ctx.lineTo(x, yAxis.bottom - 4);
              //   ctx.lineWidth = 0.5;
              //   ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
              //   ctx.stroke();
              //   ctx.restore();

              //   ctx.save();
              //   ctx.beginPath();
              //   ctx.lineWidth = 0.5;
              //   ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
              //   ctx.arc(x, yAxis.bottom, 4, 0, 4 * Math.PI, true);
              //   ctx.stroke();
              //   ctx.restore();
              // }
            },
          },
          // ChartDataLabels,
        ],
        options: {
          interaction: {
            intersect: false,
            mode: 'index',
          },
          scales: {
            x: {
              stacked: true,
              type: 'time',
              grace: '50%',
              time: {
                unit: 'day',
                displayFormats: { hour: 'HH:mm' },
              },
              max: new Date().getTime(),
              ticks: {
                // check for "major" time-point (eg: when timeseries goes to next day in an hourly view)]
                // autoSkip: true,
                major: {
                  enabled: true,
                },
                color: 'white',
                font: {
                  size: 12,
                  family: 'Lato',
                  color: 'white',
                  // change the font weight if the tick is major
                  weight: (c) => {
                    if (c.tick && c.tick.major) {
                      return 'bold';
                    } else {
                      return 'normal';
                    }
                  },
                },
              },
            },
            y: {
              stacked: true,
              grace: annotationLength ? '50%' : '30%',
              position: 'left',
              ticks: {
                color: 'white',
                font: {
                  color: 'white',
                },
              },
              title: {
                display: true,
                text: 'ETH',
              },
            },
          },
          plugins: {
            // legend
            legend: {
              display: true,
              labels: {
                color: 'white',
                usePointStyle: true,
                padding: 40,
                font: {
                  size: 16,
                  family: 'Lato',
                },
              },
            },
            // tooltip
            tooltip: {
              titleFont: {
                family: 'Lato',
              },
              padding: 8,
              boxPadding: 4,
              bodyFont: {
                size: 14,
                family: 'Lato',
              },
              bodySpacing: 10,
            },
            // zoom
            zoom: {
              zoom: {
                mode: 'x',
                drag: {
                  enabled: true,
                },
              },
              pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'ctrl',
              },
            },
            // datalabels
            // datalabels: {
            //   formatter: function (value, context) {
            //     if (value.y === '0') {
            //       return 'Transfer';
            //     } else {
            //       return 'Sale';
            //     }
            //   },
            // },
            // annotations
            annotation: {
              annotations: ANNOTATIONS,
            },
          },
        },
      };

      if (chartInstance) {
        chartInstance.update(optionsObject);
      } else {
        const newChartInstance = new Chart(canvasRef.current, optionsObject);

        setChartInstance(newChartInstance);
      }
    }

    return () => {
      chartInstance && chartInstance.destroy();
    };
  }, [datahistory, canvasRef]);

  return (
    <React.Fragment>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Historical transactions for {token_id}</Typography>
          <Stack direction="row" gap={2}>
            <Button
              size="small"
              onClick={() => {
                chartInstance.resetZoom();
              }}
              variant="contained"
            >
              reset zoom
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'hidden', position: 'relative' }}>
        <Box padding={2} sx={{ position: 'relative', overflow: 'hidden' }}>
          {loading && (
            <Backdrop open={true}>
              <CircularProgress />
            </Backdrop>
          )}

          <canvas ref={canvasRef} />
        </Box>
      </DialogContent>
    </React.Fragment>
  );
};

export default HistoricalChartNFT;
