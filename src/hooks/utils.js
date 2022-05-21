import { RateLimit } from 'async-sema';
import DataLoader from 'dataloader';
import Moralis from 'moralis';

const formatNumber = (n, type) => {
  if (typeof n === 'string') {
    n = parseFloat(n);
  }

  if (isNaN(n)) {
    return '---';
  }

  switch (type) {
    case 'financial':
    case 'area':
      return Math.round((n + Number.EPSILON) * 100) / 100;
    case 'coordinates':
      return Math.round((n + Number.EPSILON) * 10000) / 10000;
    case 'integer':
      return Math.round((n + Number.EPSILON) * 1) / 1;

    default:
      return Math.round((n + Number.EPSILON) * 100) / 100;
  }
};

const openSeaPublicRateLimit = RateLimit(2);

const OPENSEA_SHARED_CONTRACT_ADDRESSES = [
  '0x495f947276749ce646f68ac8c248420045cb7b5e',
  '0x2953399124f0cbb46d2cbacd8a89cf0599974963',
];
// Not exactly right but good enough to split tokenIds into their unique collections
const OPENSEA_SHARED_CONTRACT_COLLECTION_ID_LENGTH = 60;

const collectionSlugLoader = new DataLoader(
  async (keys) => {
    const { address, tokenId } = keys[0];
    await openSeaPublicRateLimit();
    const asset = await fetch(
      `https://api.opensea.io/api/v1/asset/${address}/${tokenId}`
    ).then((res) => res.json());

    return [asset.collection.slug];
  },
  {
    maxBatchSize: 1,
    cacheKeyFn: ({ address, tokenId }) => {
      if (OPENSEA_SHARED_CONTRACT_ADDRESSES.includes(address))
        return `${address}/${tokenId.slice(
          0,
          OPENSEA_SHARED_CONTRACT_COLLECTION_ID_LENGTH
        )}`;
      return address;
    },
  }
);

const fetchCollectionSlug = async (address, tokenId) => {
  return collectionSlugLoader.load({ address, tokenId });
};

const collectionSubLoader = new DataLoader(async (addresses) => {
  const CollectionSub = Moralis.Object.extend('CollectionSub');
  const query = new Moralis.Query(CollectionSub);
  query.containedIn('contract_address', addresses);

  const res = await query.find();

  const collSubString = JSON.stringify(res, null, 2);

  const results = collSubString ? JSON.parse(collSubString) : null;

  return addresses.map((thisaddress) =>
    results.find(({ contract_address }) => contract_address === thisaddress)
  );
});

const fetchCollectionSub = async (address) => {
  if (!address) {
    return null;
  }
  return await collectionSubLoader.load(address);
};

const clearCollectionSub = async (address) => {
  return collectionSubLoader.clear(address);
};

const abbrevNumber = (n) => {
  const cleanExponentialDecimals = (n) => n.toString().split('+')[0];
  const num = n ? parseFloat(cleanExponentialDecimals(n), 10) : 0;

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  if (num <= -1000000000) {
    return '-' + (num / -1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num <= -1000000) {
    return '-' + (num / -1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num <= -1000) {
    return '-' + (num / -1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  let formNum = num ? num.toFixed(2) : 0;
  if (formNum.toString().indexOf('.00') !== -1) formNum = parseInt(formNum, 10);

  return formNum;
};

function numberWithCommas(x) {
  if (x === null) return '---';
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}

const fetchAllCollectionsForUser = async (address, list = [], offset = 0) => {
  await openSeaPublicRateLimit();
  const collections = await fetch(
    `https://api.opensea.io/api/v1/collections?asset_owner=${address}&offset=${offset}&limit=300`
  ).then((res) => res.json());
  const updatedList = list.concat(
    collections.map((collection) => {
      return {
        slug: collection.slug,
        name: collection.name,
        image: collection.image_url,
        ownedCount: collection.owned_asset_count,
      };
    })
  );
  if (collections.length === 300) {
    return fetchAllCollectionsForUser(address, updatedList, offset + 300);
  } else {
    return updatedList;
  }
};

export const floorPriceLoader = new DataLoader(
  async (keys) => {
    const [slug] = keys;
    await openSeaPublicRateLimit();
    const { stats } = await fetch(
      `https://api.opensea.io/api/v1/collection/${slug}/stats`
    ).then((res) => res.json());
    return [
      {
        price: Math.round(stats.floor_price * 10000) / 10000,
        floorSearchUrl: `https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`,
        currency: 'ETH',
      },
    ];
  },
  {
    maxBatchSize: 1,
  }
);

const fetchFloorPrice = (collectionSlug) => {
  return floorPriceLoader.load(collectionSlug);
};

const shortenAddress = (address) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

const getRarityOverview = async (openSeaCollection) => {
  const collectionTotalTraits = openSeaCollection.traits;
  const rarestCombination = Object.entries(collectionTotalTraits).reduce(
    (acc, [trait_key, traitObject]) => {
      const sortedByRarity = Object.entries(traitObject)
        .sort(([a_key, a_value], [b_key, b_value]) => {
          return a_value - b_value;
        })
        .map(([key, val]) => {
          return { [key]: val };
        });

      acc[trait_key] = sortedByRarity;

      return acc;
    },
    {}
  );
  const totalTraitsPositions = Object.values(rarestCombination).reduce(
    (acc, el) => acc + el.length,
    0
  );

  return {
    collectionTotalTraits,
    rarestCombination,
    totalTraitsPositions,
  };
};

export {
  formatNumber,
  fetchCollectionSlug,
  fetchCollectionSub,
  clearCollectionSub,
  abbrevNumber,
  numberWithCommas,
  fetchAllCollectionsForUser,
  fetchFloorPrice,
  shortenAddress,
  getRarityOverview,
};
