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

function detectShopifyApps() {
  const appIndicators = {
    'Klaviyo': [
      'klaviyo.com/onsite',
      'klaviyo.com/media',
      'klaviyo-forms'
    ],
    'Judge.me': [
      'judge.me/reviews',
      'judgeme.com',
      'judge-widget'
    ],
    'Loox': [
      'loox.io/widget',
      'loox.io/reviews',
      'loox-reviews'
    ],
    'Stamped.io': [
      'stamped.io',
      'stamped-reviews',
      'stamped-io-widget'
    ],
    'Privy': [
      'privy.com/widget',
      'privy-embed-editor',
      'privy.com/latest'
    ],
    'ReCharge': [
      'rechargeapps.com',
      'subscription-widget',
      'recharge-payments'
    ],
    'Gorgias': [
      'gorgias.chat',
      'gorgias-web-messenger',
      'gorgias.com'
    ],
    'Shopify Reviews': [
      'shopify.com/reviews',
      'shopifycdn.com/shopify-product-reviews',
      'spr-reviews'
    ],
    'Aftership': [
      'aftership.com',
      'track.aftership.com',
      'aftership-tracking'
    ],
    'Smile.io': [
      'smile.io',
      'smile-rewards',
      'sweettooth.io'
    ],
    'Shogun': [
      'getshogun.com',
      'shogunlabs.com',
      'shogun-page'
    ],
    'Omnisend': [
      'omnisend.com',
      'omnisrc.com',
      'omnisend-widget'
    ],
    'Klarna': [
      'klarna.com',
      'klarnaservices.com',
      'klarna-payments'
    ],
    'Shop Pay': [
      'shop.app',
      'shopifycdn.com/shop',
      'shop-pay'
    ],
    'PayPal': [
      'paypal.com/sdk',
      'paypalobjects.com',
      'paypal-buttons'
    ],
    'Google Analytics': [
      'google-analytics.com',
      'analytics.google.com',
      'ga-audiences'
    ],
    'Facebook Pixel': [
      'connect.facebook.net',
      'facebook.com/tr',
      'fbevents.js'
    ],
    'TikTok Pixel': [
      'tiktok.com/pixel',
      'analytics.tiktok.com',
      'ttq.js'
    ],
    'Hotjar': [
      'hotjar.com',
      'static.hotjar.com',
      'hotjar-analytics'
    ],
    'Yotpo': [
      'yotpo.com/widget',
      'yotpo.com/reviews',
      'yotpo-reviews-widget'
    ],
    'Affirm': [
      'affirm.com',
      'affirm-widget',
      'affirm-payment'
    ],
    'Zendesk': [
      'zendesk.com/embeddable',
      'zdassets.com',
      'zopim.com'
    ],
    'Mailchimp': [
      'mailchimp.com',
      'list-manage.com',
      'chimpstatic.com'
    ],
    'Tidio': [
      'tidio.co',
      'tidiochat.com',
      'tidio-live-chat'
    ],
    'Back in Stock': [
      'back-in-stock',
      'restore-notifications',
      'bis-button'
    ]
  };

  const detectedApps = [];
  const pageSource = document.documentElement.innerHTML;

  for (const [app, indicators] of Object.entries(appIndicators)) {
    if (indicators.some(indicator => pageSource.includes(indicator))) {
      detectedApps.push(app);
    }
  }

  return detectedApps;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "checkShopify") {
      sendResponse({
        isShopify: checkForShopify(),
        url: window.location.hostname,
        apps: detectShopifyApps()
      });
    }
  }
);
