document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('save-btn');
  const storeUrl = document.getElementById('store-url');
  const viewProductsBtn = document.getElementById('viewProductsBtn');
  viewProductsBtn.style.display = 'none';


  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "checkShopify"}, function(response) {
      const shopifyCheckDiv = document.getElementById('shopify-check');

        if (chrome.runtime.lastError) {
        shopifyCheckDiv.textContent = "❌ This store is not built with shopify.";
        shopifyCheckDiv.classList.add('non-shopify-store');
        storeUrl.textContent = tabs[0].url;

        if (tabs[0].url === 'chrome-extension://pkcajeiphklacnjejhljkfnhjoeddofo/stores.html') {
          storeUrl.textContent = "you are currently on the extension's page.";
        }
        return;
        }

  
        if (response && response.isShopify) {
          shopifyCheckDiv.textContent = "✅ This store is built with Shopify!";
          shopifyCheckDiv.classList.add('shopify-store');
          viewProductsBtn.style.display = 'block';
          // saveBtn.style.display = 'block'; 
          storeUrl.textContent = response.url;

          viewProductsBtn.addEventListener('click', ()=>{
            chrome.tabs.create({
              url: `products.html?store=${response.url}`
            })
          });

        } else if (response && !response.isShopify) {
          shopifyCheckDiv.textContent = "❌ This store is not built with Shopify.";
          shopifyCheckDiv.classList.add('non-shopify-store');
          storeUrl.textContent = response.url;
        }
      });
    });

    // saveBtn.addEventListener('click', () => {
    //   chrome.runtime.sendMessage({action: "trackStore", storeUrl: storeUrl.textContent});
    //   saveBtn.textContent = "Store Saved";
    //   saveBtn.disabled = true;

    //   chrome.tabs.create({url: "stores.html"});
    // })

    
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      // Wait for the store to be saved
      await chrome.runtime.sendMessage({
        action: "trackStore", 
        storeUrl: storeUrl.textContent
      });

      saveBtn.textContent = "Store Saved!";
      
      // Open stores.html in a new tab
      chrome.tabs.create({url: "stores.html"});
    } catch (error) {
      console.error('Error saving store:', error);
      saveBtn.textContent = "Error saving store";
      saveBtn.disabled = false;
    }
  });

  const viewStoresBtn = document.getElementById('viewSavedStoresBtn');
  viewStoresBtn.addEventListener('click', () => {
    chrome.tabs.create({url: "stores.html"});
  });

    
  });
