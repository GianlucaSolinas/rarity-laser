import React from 'react';
import ReactDOM from 'react-dom';
import { getExtensionConfig } from '../../hooks/extensionConfig';
import AppProvider from '../../components/AppProvider';
import AssetInfo from '../../components/AssetInfo';
import { getAssetProps, fetchOpenSeaCollection } from '../../hooks/collection';
import _ from 'lodash';
import {
  fetchCollectionSlug,
  fetchCollectionSub,
  getRarityOverview,
} from '../../hooks/utils';
import Moralis from 'moralis';
import CollectionStats from '../../components/CollectionStats';
import ProfileInfo from '../../components/ProfileInfo';
import BundleVerification from '../../components/BundleVerification';
// import { OpenSeaPort, Network } from 'opensea-js';

const RENDERED_KEY = '__RarityLaser_rendered';

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

let injectedReactContainers = [];

const injectReact = (content, target, opts) => {
  // if (opts?.autoDestroy !== false) {
  injectedReactContainers.push(target);
  // }
  ReactDOM.render(<AppProvider>{content}</AppProvider>, target, opts?.callback);
};

// const destroyRemovedInjections = () => {
//   window.requestIdleCallback(() => {
//     // if (!cleanupActive) return;
//     injectedReactContainers = injectedReactContainers.filter((container) => {
//       if (!document.body.contains(container)) {
//         ReactDOM.unmountComponentAtNode(container);
//         return false;
//       }
//       return true;
//     });
//   });
// };

const assetInfoRenderer = async (openSeaCollection, rarityOverview) => {
  const render = () => {
    try {
      const selectedNodes = document.querySelectorAll(
        '.RarityLaserAssetInfo--unrendered'
      );

      if (selectedNodes.length !== 0) {
        const nodes = [...Array.from(selectedNodes)];

        nodes.forEach(async (node) => {
          const props = JSON.parse(node.dataset['props']);
          const type = node.dataset['type'];

          node.classList.remove('RarityLaserAssetInfo--unrendered');
          node.classList.add('RarityLaserAssetInfo');
          node.classList.add(`RarityLaserAssetInfo--${type}`);

          const collectionObject = await fetchCollectionSub(props.address);

          if (!collectionObject) {
            node.dataset['waitingSub'] = props.address;
          }

          injectReact(
            <AssetInfo
              {...props}
              collectionObject={collectionObject}
              openSeaCollection={openSeaCollection}
              rarityOverview={rarityOverview}
              type={type}
              parentNode={node}
            />,
            node
          );
        });
      }
    } catch (err) {
      console.error('AssetInfo inject error', err);
    }
    setTimeout(() => {
      window.requestIdleCallback(render, { timeout: 1000 });
    }, 500);
  };
  window.requestIdleCallback(render, { timeout: 1000 });
};

const refreshAssetInfo = () => {
  const selectedNodes = document.querySelectorAll(
    '[data-should-update="true"]'
  );
  const nodes = [...Array.from(selectedNodes)];

  nodes.forEach(async (node) => {
    const props = JSON.parse(node.dataset['props']);

    const collectionObject = await fetchCollectionSub(props.address);
    let openSeaCollection = null;

    if (!collectionObject) {
      openSeaCollection = await fetchOpenSeaCollection(
        await fetchCollectionSlug(props.address, props.token_id)
      );
    }

    node.dataset['shouldUpdate'] = false;

    injectReact(
      <AssetInfo
        {...props}
        collectionObject={collectionObject}
        openSeaCollection={openSeaCollection}
        type={node.dataset['type']}
      />,
      node
    );
  });
};

const setupAssetInfo = async () => {
  const listItems = Array.from(
    document.getElementsByClassName('AssetCell--link')
  )
    .filter((assetElement) => {
      let hasAlreadyInjected = [];

      hasAlreadyInjected = assetElement.parentNode.querySelectorAll(
        'div.RarityLaserAssetInfo, div.RarityLaserAssetInfo--unrendered'
      );

      return hasAlreadyInjected.length === 0;
    })
    .map((e) => ({ assetElement: e, type: 'list_item' }));

  const cardItems = Array.from(document.getElementsByClassName('Asset--anchor'))
    .filter((assetElement) => {
      let hasAlreadyInjected = [];

      hasAlreadyInjected = assetElement.parentNode.querySelectorAll(
        'div.RarityLaserAssetInfo, div.RarityLaserAssetInfo--unrendered'
      );

      return hasAlreadyInjected.length === 0;
    })
    .map((e) => ({ assetElement: e, type: 'card_item' }));

  [...listItems, ...cardItems].forEach(async ({ assetElement, type }) => {
    const props = getAssetProps(assetElement, type);

    const elem = document.createElement('div');
    elem.classList.add('RarityLaserAssetInfo--unrendered');
    elem.classList.add(`RarityLaserAssetInfo--${type}`);

    // props = {address, token_id, chain}
    elem.dataset['props'] = JSON.stringify(props);
    elem.dataset['type'] = type;

    if (type === 'card_item') {
      insertAfter(elem, assetElement);
    } else {
      assetElement.parentNode
        .querySelector('.AssetCell--container')
        .prepend(elem);
    }
  });
};

const injectBundleVerification = () => {
  const bundleFrames = Array.from(
    document.querySelectorAll('.Bundle--summary-frame')
  );

  console.log('bundleFrames', bundleFrames);
  bundleFrames.forEach((bundleFrame) => {
    if (!bundleFrame || bundleFrame.dataset[RENDERED_KEY]) return;

    bundleFrame.dataset[RENDERED_KEY] = '1';
    const assets = Array.from(
      bundleFrame.querySelectorAll('.Bundle--items-list > a')
    );

    if (assets.length) {
      const addresses = _.groupBy(
        assets,
        (asset) => asset.attributes.href.value.split('/')[2]
      );

      const numAddresses = Object.keys(addresses).length;

      const header = bundleFrame.querySelector('.Panel--header');

      if (header) {
        const container = document.createElement('div');
        container.classList.add('SuperSea__BundleVerification');
        header.parentNode?.insertBefore(container, header.nextSibling);
        injectReact(
          <BundleVerification numAddresses={numAddresses} />,
          container
        );
      }
    }
  });
};

const setupProfileInfo = async () => {
  if (document.querySelector('.ProfileInfo--rendered')) {
    console.log('found ProfileInfo--rendered');
  } else {
    const addressLinkElement = document.querySelector(
      '.AccountHeader--address'
    );

    const accountHeaderNode = document.querySelector(
      '.AccountHeader--subtitle'
    );

    if (addressLinkElement) {
      const shortenedAddress = addressLinkElement.innerText;

      const profileInfoNode = document.createElement('div');

      profileInfoNode.classList.add('ProfileInfo--rendered');
      profileInfoNode.style.width = '100%';

      accountHeaderNode.parentNode.append(profileInfoNode);

      injectReact(
        <ProfileInfo shortenedAddress={shortenedAddress} />,
        profileInfoNode
      );
    }
  }
};

const injectCollectionStats = (collectionObject) => {
  const headerDescriptionElement = document.querySelector(
    '.CollectionHeader--description'
  );

  if (!headerDescriptionElement) {
    return;
  }

  if (
    headerDescriptionElement.parentNode.querySelectorAll(
      '.RarityLaser--CollectionStats'
    ).length
  ) {
    return;
  }

  const node = document.createElement('div');

  node.style.minWidth = '50vw';

  headerDescriptionElement.parentNode.insertBefore(
    node,
    headerDescriptionElement
  );
  injectReact(<CollectionStats collectionObject={collectionObject} />, node);
};

// asset info
const throttledSetupAssetInfo = _.throttle(setupAssetInfo, 500);
const throttledInjectAssetInfo = _.throttle(assetInfoRenderer, 500);
const throttledRefreshAssetInfo = _.throttle(refreshAssetInfo, 500);
const throttledInjectCollectionStats = _.throttle(injectCollectionStats, 1000);

// bundle verification
const throttledBundleVerification = _.throttle(injectBundleVerification, 500);

// account info page
const throttledSetupProfileInfo = _.throttle(setupProfileInfo, 500);
// const throttledProfileInfo = _.throttle(injectProfileInfo, 500);
// const throttledDestroyRemovedInjections = _.throttle(
//   destroyRemovedInjections,
//   1000
// );

// window.addEventListener('message', async (event) => {
//   if (event.origin !== 'https://opensea.io') return;
//   if (event.data.method === 'RarityLaserBidBuy') {
//   }
// });

const setupInjections = async () => {
  const observer = new MutationObserver(async () => {
    const splitLink = window.location.pathname.split('/');

    let openSeaCollection = null;
    let rarityOverview = null;

    if (splitLink[1] === 'collection') {
      openSeaCollection = await fetchOpenSeaCollection(splitLink[2]);
      rarityOverview = await getRarityOverview(openSeaCollection);
    }

    throttledSetupAssetInfo(openSeaCollection, rarityOverview);
    throttledInjectAssetInfo(openSeaCollection, rarityOverview);
    throttledRefreshAssetInfo(openSeaCollection, rarityOverview);
    throttledInjectCollectionStats(openSeaCollection, rarityOverview);

    throttledSetupProfileInfo();
    throttledBundleVerification();
    // throttledDestroyRemovedInjections();
  });

  observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });
};

const injectFont = () => {
  var linkElement = document.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('type', 'text/css');
  linkElement.setAttribute(
    'href',
    'data:text/css;charset=UTF-8,' +
      encodeURIComponent(
        'https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap'
      )
  );
  document.head.appendChild(linkElement);
};

const initialize = async () => {
  injectFont();
  // const rootElem = document.createElement('div');
  // document.body.append(rootElem);
  // ReactDOM.render(<AppProvider></AppProvider>, rootElem);

  const config = await getExtensionConfig();

  if (config.enabled) {
    await Moralis.start({
      serverUrl: 'https://matgrqe0cq1z.usemoralis.com:2053/server',
      appId: 'UHCopLz11iLSe1fk4yQ81qjpU4tvaAuG5WAlHuHi',
    });

    setupInjections();
  } else {
    console.log('REMOVE INJECTIONS');
  }
};

initialize();
