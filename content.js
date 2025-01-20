function checkForShopify() {
  const shopifyIndicators = [
    'Shopify.shop',
    'cdn.shopify.com',
    'shopify-payment-button'
  ];

  for (let indicator of shopifyIndicators) {
    if (document.documentElement.innerHTML.includes(indicator)) {
      console.log('this is a shopify store');

      chrome.runtime.sendMessage({
        action: "updateIcon",
        isShopify: true
      });
      
      return true;
    }
    else {
      console.log('this is not a shopify store');
      chrome.runtime.sendMessage({
        action: "updateIcon",
        isShopify: false
      });
      return false;
      
    }
  }
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "checkShopify") {
      sendResponse({
        isShopify: checkForShopify(),
        url: window.location.hostname,
        });
    }
  }
);
