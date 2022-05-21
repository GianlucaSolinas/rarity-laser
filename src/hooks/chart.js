import chroma from 'chroma-js';

const getGradient = (
  ctx,
  chartArea,
  { color = 'white', alpha = 0.7, nSteps = 3 }
) => {
  const gradientBg = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom
  );

  const scale = chroma.scale([color, '#282C34']);

  const arrValues = [...Array(nSteps).keys()].map((e, index) => {
    return e / nSteps;
  });

  arrValues.forEach((e) => {
    gradientBg.addColorStop(e, scale(e).alpha(alpha).css());
  });

  return gradientBg;
};

const createChartGradient = (context, colorOptions) => {
  const chart = context.chart;
  const { ctx, chartArea } = chart;

  if (!chartArea) {
    return null;
  }

  return getGradient(ctx, chartArea, colorOptions);
};

export { createChartGradient };
