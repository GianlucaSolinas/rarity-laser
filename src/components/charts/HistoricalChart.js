import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import zoomPlugin from 'chartjs-plugin-zoom';

import chroma from 'chroma-js';
import React, { useEffect, useRef, useState } from 'react';
import { format, sub } from 'date-fns';
import { createChartGradient } from '../../hooks/chart';
import ky from 'ky';
import web3 from 'web3';
import { web } from 'webpack';
import { useQuery } from 'react-query';
import { fetchHistoricalCollection } from '../../queries/covalent';

Chart.register(zoomPlugin);

const LAST_DATA_DATE = '2022-04-06';

const HistoricalChart = ({ collectionObject, onClose }) => {
  const [chartInstance, setChartInstance] = useState(null);
  const [datahistory, setDataHistory] = useState(null);
  const [currentTimeRangeOption, setCurrentTimeRangeOption] =
    useState('7 days');

  const canvasRef = useRef(null);

  const primaryContract = collectionObject
    ? collectionObject.primary_asset_contracts[0]
    : null;

  const [nDuration, duration] = currentTimeRangeOption.split(' ');

  const fromDate = format(
    sub(new Date(LAST_DATA_DATE), { [duration]: nDuration }),
    'yyyy-MM-dd'
  );

  const { isLoading } = useQuery(
    [
      'getHistoricalCollection',
      { address: primaryContract.address, from: fromDate, to: LAST_DATA_DATE },
    ],
    fetchHistoricalCollection,
    {
      onSuccess: (res) => {
        if (res === null) {
          return;
        } else {
          setDataHistory(res.items);
        }
      },
      onError: (err) => {
        console.error(err);
      },
    }
  );

  const getDatasets = () => {
    const datasets = [
      {
        label: 'Volume (day)',
        order: 100,
        data: datahistory.map((e) => ({
          x: new Date(e.opening_date).getTime(),
          y: web3.utils.fromWei(e.volume_wei_day),
        })),
        color: '#D2D9FE',
        yAxisID: 'y2',
        borderColor: '#D2D9FE',
        pointRadius: 0,
        backgroundColor: (c) => createChartGradient(c, { color: '#D2D9FE' }),
        fill: 'origin',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: 'Avg Volume (day)',
        order: 50,
        data: datahistory.map((e) => ({
          x: new Date(e.opening_date).getTime(),
          y: web3.utils.fromWei(e.average_volume_wei_day),
        })),
        yAxisID: 'y',
        color: '#FFD1C7',
        borderColor: '#FFD1C7',
        backgroundColor: '#FFD1C7',
        tension: 0.15,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Avg Floor price (7 days)',
        order: 0,
        data: datahistory.map((e) => ({
          x: new Date(e.opening_date).getTime(),
          y: web3.utils.fromWei(e.floor_price_wei_7d),
        })),
        yAxisID: 'y',
        type: 'bar',
        color: '#39FF14',
        borderColor: (c) => createChartGradient(c, { color: '#39FF14' }),
        backgroundColor: (c) => createChartGradient(c, { color: '#39FF14' }),
        borderWidth: 2,
        maxBarThickness: 5,
      },
    ];

    return datasets;
  };

  useEffect(() => {
    if (datahistory) {
      if (chartInstance) {
        chartInstance.data.datasets = getDatasets();
        chartInstance.update();
        return;
      }
      const optionsObject = {
        type: 'line',
        data: {
          datasets: getDatasets(),
        },
        plugins: [
          {
            id: 'afterDrawPlugin',
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
              if (chart.tooltip?._active.length) {
                let x = chart.tooltip._active[0].element.x;
                let yAxis = chart.scales.y;
                let ctx = chart.ctx;
                ctx.save();
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom - 4);
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
                ctx.arc(x, yAxis.bottom, 4, 0, 4 * Math.PI, true);
                ctx.stroke();
                ctx.restore();
              }
            },
          },
        ],
        options: {
          interaction: {
            intersect: false,
            mode: 'index',
          },
          scales: {
            x: {
              type: 'time',
              // grace: '50%',
              time: {
                round: 'day',
                unit: 'day',
                // displayFormats: { hour: 'HH:mm' },
              },
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
            y2: {
              type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
              position: 'right',
              ticks: {
                color: 'white',
                font: {
                  color: 'white',
                },
              },
              title: {
                display: true,
                text: 'ETH Volume',
              },
            },
          },
          plugins: {
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
          <Typography>Historical data</Typography>
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
            <ButtonGroup size="small">
              {['6 months', '30 days', '7 days'].map((el) => {
                const isActive = el === currentTimeRangeOption;

                return (
                  <Button
                    variant={isActive ? 'outlined' : 'contained'}
                    key={el}
                    onClick={() => {
                      setCurrentTimeRangeOption(el);
                    }}
                  >
                    {el}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'hidden', position: 'relative' }}>
        <Box padding={2} sx={{ position: 'relative', overflow: 'hidden' }}>
          {isLoading && (
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

export default HistoricalChart;
