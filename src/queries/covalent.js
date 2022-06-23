import ky from 'ky';

const API_URL = 'https://api.covalenthq.com/v1';
const API_KEY = 'ckey_e53411317f40450b8b679520247';

const CHAIN_IDS = {
  ETH: 1,
};

async function fetchHistoricalCollection({ queryKey }) {
  const [_key, { address, from, to }] = queryKey;
  try {
    return await ky
      .get(
        `${API_URL}/${CHAIN_IDS['ETH']}/nft_market/collection/${address}/?from=${from}&to=${to}&quote-currency=EUR&format=JSON&key=${API_KEY}`
      )
      .json();
  } catch (error) {
    return null;
  }
}

export { fetchHistoricalCollection };
