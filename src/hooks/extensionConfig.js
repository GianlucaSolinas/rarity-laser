import { useEffect, useState } from 'react';

const DEFAULTS = {
  enabled: false,
  quickBuyEnabled: false,
  notificationSounds: true,
  quickBuyGasPreset: 'none',
  fixedGas: { priorityFee: 25, fee: 300 },
};

let configPromise = null;
export const getExtensionConfig = async (cached = true) => {
  if (!configPromise || !cached) {
    configPromise = new Promise((resolve) => {
      chrome.storage.sync.get(['extensionConfig'], resolve);
    });
  }
  const val = await configPromise;
  return { ...DEFAULTS, ...val?.extensionConfig };
};

export const saveExtensionConfig = (config) => {
  chrome.storage.sync.set({ extensionConfig: config });
};

export const useExtensionConfig = () => {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    (async () => {
      setConfig(await getExtensionConfig());
    })();
  }, []);

  return [
    config,
    (updatedConfig) => {
      setConfig(updatedConfig);
      saveExtensionConfig(updatedConfig);
    },
  ];
};
