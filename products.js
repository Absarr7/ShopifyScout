document.addEventListener('DOMContentLoaded', async function() {
    // Get store URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const storeUrl = urlParams.get('store');

    if (!storeUrl) {
        document.querySelector('.store-header').textContent = 'No store specified';
        document.getElementById('products-container').innerHTML = 'Please provide a store URL';
        return;
    }

    document.querySelector('.store-header').textContent = storeUrl;

    try {
        const productsContainer = document.getElementById('products-container');
        let page = 1;
        let allProducts = [];
        const productsPerPage = 50;

        async function fetchProducts() {
            const response = await fetch(`https://${storeUrl}/products.json?limit=250&page=${page}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        }

        async function fetchAllProducts() {
            let currentPage = 1;
            let hasMoreProducts = true;
            let allProducts = [];

            while (hasMoreProducts) {
                const response = await fetch(`https://${storeUrl}/products.json?limit=250&page=${currentPage}`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                
                if (data.products.length === 0) {
                    hasMoreProducts = false;
                } else {
                    allProducts = [...allProducts, ...data.products];
                    currentPage++;
                }
            }
            return allProducts;
        }

        async function fetchShopInfo() {
            const response = await fetch(`https://${storeUrl}/meta.json`);
            if (!response.ok) throw new Error('Failed to fetch shop info');
            return await response.json();
        }

        // Fetch both shop info and products
        const [shopInfo, products] = await Promise.all([fetchShopInfo(), fetchAllProducts()]);
        allProducts = products;
        document.querySelector('.total-products').textContent = `Total products: ${allProducts.length}`;

        // Function to display products for current page
        function displayProducts(pageNum) {
            const startIndex = (pageNum - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const productsToShow = allProducts.slice(startIndex, endIndex);

            productsContainer.innerHTML = productsToShow.map(product => `
                <div class="product-card">
                    <img class="product-image" src="${product.images[0]?.src || '/icons/noimage.jpg'}" alt="${product.title}">
                    <p class='product-date'>added on: ${new Date(product.published_at).toLocaleDateString()}</p>
                    <h3 class='product-name'>${product.title}</h3>
                    <p class='product-price'>Price: ${product.variants[0]?.price ? new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: shopInfo.currency || 'USD'
                    }).format(product.variants[0].price) : 'Price not available'}</p>
                    
                </div>
            `).join('');

            // Update pagination controls
            const totalPages = Math.ceil(allProducts.length / productsPerPage);
            document.querySelector('.pagination span').textContent = `Page ${pageNum} of ${totalPages}`;
            
            // Enable/disable pagination buttons
            document.querySelector('.prev-page').disabled = pageNum === 1;
            document.querySelector('.next-page').disabled = pageNum === totalPages;
        }

        // Add pagination controls to the DOM
        const paginationHTML = `
            <div class="pagination-controls">
                <div class="pagination">
                    <button class="prev-page">Previous</button>
                    <span>Page 1 of 1</span>
                    <button class="next-page">Next</button>
                </div>
            </div>
        `;
        productsContainer.insertAdjacentHTML('beforebegin', paginationHTML);

        // Add event listeners for pagination
        let currentPage = 1;
        document.querySelector('.prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProducts(currentPage);
            }
        });

        document.querySelector('.next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(allProducts.length / productsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayProducts(currentPage);
            }
        });

        // Initial display
        displayProducts(currentPage);

    } catch (error) {
        document.getElementById('products-container').innerHTML = 'Error loading products: ' + error.message;
    }
});