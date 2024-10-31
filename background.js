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
    }
  });
  
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
      const response = await fetch(`https://${storeUrl}/products.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const result = await chrome.storage.local.get('stores');
      const stores = result.stores || [];
      const storeIndex = stores.findIndex(s => s.url === storeUrl);
      
      if (storeIndex !== -1) {
        stores[storeIndex].products = data.products;
        stores[storeIndex].lastUpdated = Date.now();
        await chrome.storage.local.set({ stores });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }