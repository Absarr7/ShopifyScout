document.addEventListener('DOMContentLoaded', async function() {
    let activeStoreUrl = null;
    const storesList = document.getElementById('stores-list');
    const productsView = document.getElementById('products-view');
    const storeCount = document.querySelector('.store-count');
    const ITEMS_PER_PAGE = 50;
    let currentPage = 1;

    // Load and display stores
    const data = await chrome.storage.local.get('stores');
    const stores = data.stores || [];
    
    // Update store count
    storeCount.textContent = `${stores.length} store${stores.length !== 1 ? 's' : ''} saved`;

    // Display stores in sidebar
    stores.forEach(store => {
        const storeItem = document.createElement('div');
        storeItem.className = 'store-item';
        
        storeItem.innerHTML = `
            <span>${store.url}</span>
            <button class="remove-btn">🗑️</button>
        `;

        storeItem.querySelector('.remove-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const updatedStores = stores.filter(s => s.url !== store.url);
            await chrome.storage.local.set({ stores: updatedStores });
            storeItem.remove();
            storeCount.textContent = `${updatedStores.length} store${updatedStores.length !== 1 ? 's' : ''} saved`;
            if (activeStoreUrl === store.url) {
                productsView.innerHTML = '<div class="no-store-selected">Select a store to view its products</div>';
                activeStoreUrl = null;
            }
        });

        storeItem.addEventListener('click', () => {
            // Remove active class from all stores
            document.querySelectorAll('.store-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked store
            storeItem.classList.add('active');
            
            activeStoreUrl = store.url;
            currentPage = 1; // Reset to first page when switching stores
            displayProducts(store);
        });

        storesList.appendChild(storeItem);
    });

    function displayProducts(store) {
        productsView.innerHTML = ''; // Clear current products
        
        const header = document.createElement('h1');
        header.style.color = "#6f2cf5"
        header.textContent = store.url;
    
        const lastUpdated = document.createElement('p');
        lastUpdated.innerHTML = `Last updated: ${new Date(store.lastUpdated).toLocaleString()} <br> Total products: ${store.products.length}`;
    
        // Calculate pagination
        const totalPages = Math.ceil(store.products.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentProducts = store.products.slice(startIndex, endIndex);
    
        // Create pagination controls
        const paginationInfo = document.createElement('div');
        paginationInfo.className = 'pagination-info';
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
        // Function to create pagination controls
        function createPaginationControls() {
            const paginationControls = document.createElement('div');
            paginationControls.className = 'pagination-controls';
    
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.disabled = currentPage === 1;
            prevButton.onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayProducts(store);
                }
            };
    
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.disabled = currentPage === totalPages;
            nextButton.onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayProducts(store);
                }
            };
    
            paginationControls.appendChild(prevButton);
            paginationControls.appendChild(nextButton);
            return paginationControls;
        }
    
        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        
        currentProducts.forEach(product => {
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
        productsView.appendChild(paginationInfo);
        productsView.appendChild(createPaginationControls()); // Top pagination
        productsView.appendChild(productsGrid);
        productsView.appendChild(createPaginationControls()); // Bottom pagination
    }
});