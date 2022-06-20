import { SvgIcon } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { FaEthereum } from 'react-icons/fa';

const WhaleIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M28.63 16.812c0 0 -20.326 0 -20.491 0c-2.317 0 -4.183 -1.85 -4.183 -4.168c0 -1.147 0.462 -2.185 1.207 -2.944l2.711 2.711c1.571 1.571 4.117 1.571 5.687 0L9.422 8.274c-0.98 -0.979 -2.51 -1.069 -3.595 -0.276c0.794 -1.085 0.704 -2.615 -0.276 -3.595L1.412 0.265c-1.571 1.571 -1.571 4.117 0 5.687l2.419 2.419C1.59 10.348 0.234 12.916 0.234 15.726C0.234 21.923 6.832 26.953 15.002 27.02c0 0 0 2.714 0 2.714c0 0 1.298 0.029 2.388 -0.877c0.824 -0.685 1.304 -1.742 1.304 -2.814V22.699c1.49 -0.353 3.893 -1.151 5.788 -3.118h0.917c-1.205 1.591 -3.613 3.034 -6.012 3.655v1.312c3.418 -0.85 6.124 -2.676 7.571 -4.967h0.804c-1.504 2.651 -4.523 4.762 -8.375 5.678v0.782c0 0.178 -0.012 0.352 -0.032 0.524c5.148 -1.136 9.148 -4.309 10.361 -8.291C29.938 17.548 29.39 16.812 28.63 16.812zM20.9 20.052h-0.571c-0.256 0 -0.462 -0.206 -0.462 -0.462c0 -0.256 0.206 -0.462 0.462 -0.462h0.571c0.256 0 0.462 0.206 0.462 0.462C21.362 19.846 21.156 20.052 20.9 20.052z" />
  </SvgIcon>
);

const EthIcon = (props) => (
  <FaEthereum style={{ marginRight: '4px' }} color={grey[500]} {...props} />
);

const SolanaIcon = () => {
  const solanaLogo = chrome.runtime.getURL('solana.svg');

  return <img src={solanaLogo} alt="Solana" width="25px" height="25px" />;
};

const SpyVolcanoIcon = ({ customStyle }) => {
  const spyVolcanoLogo = chrome.runtime.getURL('logo_orange.svg');

  return <img src={spyVolcanoLogo} alt="Spy Volcano" style={customStyle} />;
};

export { WhaleIcon, EthIcon, SolanaIcon, SpyVolcanoIcon };
