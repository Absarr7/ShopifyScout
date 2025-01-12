// Store structure in chrome.storage.local:
// {
//   stores: [{
//     url: string,
//     products: array,
//     lastUpdated: timestamp
//   }]
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trackStore") {
    handleTrackStore(request.storeUrl)
      .then(() => sendResponse({success: true}))
      .catch((error) => sendResponse({success: false, error}));
    return true; // Keep the message channel open for async response
  } else if (request.action === "updateIcon") {
    updateExtensionIcon(request.isShopify);
    sendResponse({success: true});
  }
});

function updateExtensionIcon(isShopify) {
  const iconPath = isShopify ? {
    16: "/icons/active16.png",
    32: "/icons/active32.png",
    48: "/icons/active48.png",
    128: "/icons/active128.png"
  } : {
    16: "/icons/16.png",
    32: "/icons/icon32.png",
    48: "/icons/icon48.png",
    128: "/icons/icon128.png"
  };

  chrome.action.setIcon({ path: iconPath });
}

async function handleTrackStore(storeUrl) {
  try {
    // First save the store
    await saveStore(storeUrl);
    
    // Then fetch its products
    await fetchStoreProducts(storeUrl);
    
    return true;
  } catch (error) {
    console.error('Error in handleTrackStore:', error);
    throw error;
  }
}

async function saveStore(storeUrl) {
  const store = {
    url: storeUrl,
    products: [],
    lastUpdated: Date.now()
  };

  const data = await chrome.storage.local.get('stores');
  const stores = data.stores || [];
  
  // Check if store already exists
  if (!stores.some(s => s.url === storeUrl)) {
    stores.push(store);
    await chrome.storage.local.set({ stores });
  }
}

async function fetchStoreProducts(storeUrl) {
  try {
    let allProducts = [];
    let page = 1;
    let hasMoreProducts = true;

    while (hasMoreProducts) {
      const response = await fetch(`https://${storeUrl}/products.json?limit=250&page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.products.length === 0) {
        hasMoreProducts = false;
      } else {
        allProducts = [...allProducts, ...data.products];
        page++;
      }

      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const result = await chrome.storage.local.get('stores');
    const stores = result.stores || [];
    const storeIndex = stores.findIndex(s => s.url === storeUrl);
    
    if (storeIndex !== -1) {
      stores[storeIndex].products = allProducts;
      stores[storeIndex].lastUpdated = Date.now();
      await chrome.storage.local.set({ stores });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}