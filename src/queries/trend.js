import ky from 'ky';

const API_URL = 'https://spy-volcano-api.herokuapp.com';

async function fetchTwitterFollowers({ queryKey }) {
  const [_key, { username }] = queryKey;

  return await ky
    .get(`${API_URL}/metrics/twitter/${username}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

async function fetchDiscordMembers({ queryKey }) {
  const [_key, { guildCode }] = queryKey;

  return await ky
    .get(`${API_URL}/metrics/discord/${guildCode}`, {
      searchParams: {
        with_counts: true,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

async function fetchOpenseaStats({ queryKey }) {
  const [_key, { slug }] = queryKey;

  return await ky
    .get(`${API_URL}/metrics/opensea/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

async function fetchTopTenOwners({ queryKey }) {
  const [_key, { contract_address }] = queryKey;

  return await ky
    .get(`${API_URL}/metrics/whales/${contract_address}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
}

export {
  fetchDiscordMembers,
  fetchTwitterFollowers,
  fetchOpenseaStats,
  fetchTopTenOwners,
};
