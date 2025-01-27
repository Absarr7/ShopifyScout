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

        if (tabs[0].url = 'chrome-extension://pkcajeiphklacnjejhljkfnhjoeddofo/products.html') {
          shopifyCheckDiv.textContent = "❌ This store is not built with shopify.";
        shopifyCheckDiv.classList.add('non-shopify-store');
          storeUrl.textContent = "you are currently on the extension's page";
          
          
        }
        return;
        }

  
        if (response && response.isShopify) {
          shopifyCheckDiv.textContent = "✅ This store is built with Shopify!";
          shopifyCheckDiv.classList.add('shopify-store');
          viewProductsBtn.style.display = 'block';
          // saveBtn.style.display = 'block'; 
          storeUrl.textContent = response.url;


          if (response.apps && response.apps.length > 0) {
            const appsDiv = document.querySelector('.apps-container');
            const appUrls = {
              'Klaviyo': 'https://apps.shopify.com/klaviyo-email-marketing',
              'Judge.me': 'https://apps.shopify.com/judgeme',
              'Loox': 'https://apps.shopify.com/loox',
              'Stamped.io': 'https://apps.shopify.com/stamped-product-reviews-ugc',
              'Privy': 'https://apps.shopify.com/privy',
              'ReCharge': 'https://apps.shopify.com/subscription-payments',
              'Gorgias': 'https://apps.shopify.com/gorgias-live-chat-helpdesk',
              'Shopify Reviews': 'https://apps.shopify.com/product-reviews',
              'Aftership': 'https://apps.shopify.com/aftership',
              'Smile.io': 'https://apps.shopify.com/smile-io',
              'Shogun': 'https://apps.shopify.com/shogun',
              'Omnisend': 'https://apps.shopify.com/omnisend',
              'Klarna': 'https://apps.shopify.com/klarna-on-site-messaging',
              'Shop Pay': 'https://www.shopify.com/shop-pay',
              'PayPal': 'https://apps.shopify.com/paypal-express-checkout',
              'Google Analytics': 'https://apps.shopify.com/google-analytics',
              'Facebook Pixel': 'https://apps.shopify.com/facebook-pixel',
              'TikTok Pixel': 'https://apps.shopify.com/tiktok',
              'Hotjar': 'https://apps.shopify.com/hotjar',
              'Yotpo': 'https://apps.shopify.com/yotpo-social-reviews',
              'Affirm': 'https://apps.shopify.com/affirm',
              'Zendesk': 'https://apps.shopify.com/zendesk',
              'Mailchimp': 'https://apps.shopify.com/mailchimp',
              'Tidio': 'https://apps.shopify.com/tidio-chat',
              'Back in Stock': 'https://apps.shopify.com/back-in-stock'
            };
            
            appsDiv.classList.add('detected-apps');
            appsDiv.innerHTML = `
              <h3>Apps detected on this store:</h3>
              <ul>
                ${response.apps.map(app => `
                  <li class="app-list">
                    ${app}
                    ${appUrls[app] ? `
                      <button class="app-btn" data-url="${appUrls[app]}">
                        Visit app
                      </button>
                    ` : ''}
                  </li>
                `).join('')}
              </ul>
            `;

            // Add click handlers for the download buttons
            const downloadButtons = appsDiv.querySelectorAll('.app-btn');
            downloadButtons.forEach(button => {
              button.addEventListener('click', () => {
                chrome.tabs.create({ url: button.dataset.url });
              });
            });

          } else {
            const appsDiv = document.createElement('div');
            appsDiv.innerHTML = `no apps detected.`
          }

          
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

  // Add detected apps section

    
  });
