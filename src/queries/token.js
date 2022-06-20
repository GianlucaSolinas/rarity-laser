import ky from 'ky';

async function fetchSingleToken({ queryKey }) {
  const [_key, { address, token_id }] = queryKey;

  return await ky
    .get(`http://localhost:3001/token/${address}/${token_id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

async function requestSyncMetadata(obj) {
  const { contract_address, opensea_slug, chain } = obj;

  return await ky
    .post(`http://localhost:3001/sync/token`, {
      json: { contract_address, opensea_slug, chain },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

export { fetchSingleToken, requestSyncMetadata };
