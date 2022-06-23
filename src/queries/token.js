import ky from 'ky';

const API_URL = 'https://spy-volcano-api.herokuapp.com';

async function fetchSingleToken({ queryKey }) {
  const [_key, { address, token_id }] = queryKey;

  return await ky
    .get(`${API_URL}/token/${address}/${token_id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

async function requestSyncMetadata(obj) {
  const { contract_address, opensea_slug, chain } = obj;

  return await ky
    .post(`${API_URL}/sync/token`, {
      json: { contract_address, opensea_slug, chain },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

export { fetchSingleToken, requestSyncMetadata };
