document.addEventListener('DOMContentLoaded', async function() {
    let activeStoreUrl = null;
    const data = await chrome.storage.local.get('stores');
    const stores = data.stores || [];
    
    const storesList = document.getElementById('stores-list');
    const productsView = document.getElementById('products-view');
    const storeCount = document.querySelector('.store-count');
    
    // Update store count
    storeCount.textContent = `${stores.length} store${stores.length !== 1 ? 's' : ''} saved`;

    function displayProducts(store) {
        productsView.innerHTML = ''; // Clear current products
        
        const header = document.createElement('h1');
        header.style.color = "#6f2cf5"
        header.textContent = store.url;

        
        const lastUpdated = document.createElement('p');
        lastUpdated.innerHTML = `Last updated: ${new Date(store.lastUpdated).toLocaleString()} <br> Total products: ${store.products.length}`;

        
        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        
        store.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img class="product-image" src="${product.images[0]?.src || '/icons/noimage.jpg'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.variants[0]?.price ? '$' + product.variants[0].price : 'Price not available'}</p>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        productsView.appendChild(header);
        productsView.appendChild(lastUpdated);
        productsView.appendChild(productsGrid);
    }

    async function removeStore(storeUrl) {
        const updatedStores = stores.filter(store => store.url !== storeUrl);
        await chrome.storage.local.set({ stores: updatedStores });
        
        // Refresh the page to show updated list
        window.location.reload();
    }

    // Display stores in sidebar
    stores.forEach(store => {
        const storeItem = document.createElement('div');
        storeItem.className = 'store-item';
        
        const storeInfo = document.createElement('span');
        storeInfo.textContent = store.url;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-btn';
        removeButton.textContent = 'x';
        removeButton.title = 'Remove store';
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent store selection when clicking remove
            if (confirm(`Are you sure you want to remove ${store.url}?`)) {
                removeStore(store.url);
            }
        });
        
        storeItem.appendChild(storeInfo);
        storeItem.appendChild(removeButton);
        
        storeItem.addEventListener('click', () => {
            // Remove active class from all stores
            document.querySelectorAll('.store-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked store
            storeItem.classList.add('active');
            
            // Display products for selected store
            displayProducts(store);
            activeStoreUrl = store.url;
        });
        
        storesList.appendChild(storeItem);
    });
});