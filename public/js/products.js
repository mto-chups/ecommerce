import { addToCart } from './add-to-cart.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des éléments de filtrage
    const categoryFilter = document.getElementById('category-filter');
    const subcategoryFilter = document.getElementById('subcategory-filter');
    const sortOrder = document.getElementById('sort-order');
    const applyFiltersButton = document.getElementById('apply-filters');
    const productList = document.getElementById('product-list');

   

    // Charger les produits au chargement de la page
    fetchProducts();
    // Charger les filtres au démarrage
    loadFilters();

    // Fonction pour charger les produits
    function fetchProducts() {
        fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            displayProducts(products);
        })
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    }

    // Fonction pour afficher les produits
    function displayProducts(products) {
        productList.innerHTML = ''; // Effacer les produits existants
        products.forEach(product => {
            const productCard = createProductCard(product);
            productList.appendChild(productCard);
        });
        // Déclencher un événement personnalisé indiquant que les produits sont chargés
        const event = new Event('productsLoaded');
        document.dispatchEvent(event);
    }

    // Crée une carte produit
    function createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const price = parseFloat(product.price);

        // Déterminer le message de stock à afficher
        let stockMessage = 'En stock';
        if (product.stock <= 12) {
            stockMessage = `Plus que ${product.stock} en stock.`;
        }

        // Utiliser `image_name_1` s'il est disponible, sinon utiliser le nom du produit par défaut
        const imageName = product.image_name_1 ? product.image_name_1 : `${product.name}.jpg`;

        // Créer un lien pour chaque produit
        const productLink = document.createElement('a');
        productLink.href = `/product-indiv?id=${product.id}`;  // Lien vers la page de détails
        productLink.className = 'product-link';

        // Construire le contenu de la carte produit avec la description tronquée si nécessaire
        let truncatedDescription = product.description;
        const descriptionLimit = 95; // Limite de caractères pour la description tronquée

        if (truncatedDescription.length > descriptionLimit) {
            truncatedDescription = truncatedDescription.substring(0, descriptionLimit) + '...';
        }

        // Construire le contenu de la carte produit
        productLink.innerHTML = `
            <img src="/images/${imageName}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p class="product-description">${truncatedDescription}</p>
            ${product.description.length > descriptionLimit ? '<span class="see-more">Voir plus</span><span class="see-less" style="display: none;">Voir moins</span>' : ''}
            <p class="price">€${price.toFixed(2)}</p>
            <p class="stock-message">${stockMessage}</p>
        `;

        productCard.appendChild(productLink);

        // Ajouter le bouton "Ajouter au panier"
        const addButton = document.createElement('button');
        addButton.className = 'add-to-cart-btn';
        addButton.dataset.id = product.id;
        addButton.dataset.name = product.name;
        addButton.dataset.price = price;
        addButton.textContent = 'Ajouter au panier';

        productCard.appendChild(addButton);

        // Ajouter l'événement pour le bouton "Ajouter au panier"
        addButton.addEventListener('click', addToCart);
   
        // Gérer l'événement "Voir plus" pour montrer la description complète
        const seeMore = productLink.querySelector('.see-more');
        const seeLess = productLink.querySelector('.see-less');

        if (seeMore) {
            seeMore.addEventListener('click', (event) => {
                event.preventDefault();
                productLink.querySelector('.product-description').textContent = product.description;
                seeMore.style.display = 'none'; // Cacher le texte "voir plus" après le clic
                seeLess.style.display = 'inline'; // Afficher le texte "voir moins"
            });
        }
    
        // Gérer l'événement "Voir moins" pour masquer la description complète
        if (seeLess) {
            seeLess.addEventListener('click', (event) => {
                event.preventDefault();
                productLink.querySelector('.product-description').textContent = truncatedDescription;
                seeMore.style.display = 'inline'; // Afficher le texte "voir plus"
                seeLess.style.display = 'none'; // Cacher le texte "voir moins"
            });
        }

        return productCard;
    }

    // Charger les catégories et sous-catégories pour le filtrage
    function loadFilters() {
        fetch('/api/products/categories')
            .then(response => response.json())
            .then(data => {
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.categories_id;
                    option.textContent = category.categories_name;
                    categoryFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Erreur lors du chargement des catégories:', error));

        fetch('/api/products/subcategories')
            .then(response => response.json())
            .then(data => {
                data.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory.subcategory_id;
                    option.textContent = subcategory.subcategory_name;
                    subcategoryFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
    }

    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const selectedSubcategory = subcategoryFilter.value;
        const selectedSortOrder = sortOrder.value;

        let url = '/api/products?';

        if (selectedCategory) {
            url += `category=${selectedCategory}&`;
        }
        if (selectedSubcategory) {
            url += `subcategory=${selectedSubcategory}&`;
        }
        if (selectedSortOrder) {
            url += `sort=${selectedSortOrder}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayProducts(data.products);
            })
            .catch(error => console.error('Erreur lors du filtrage des produits:', error));
    }
    
    // Appliquer les filtres automatiquement lors de la modification des filtres
    categoryFilter.addEventListener('change', applyFilters);
    subcategoryFilter.addEventListener('change', applyFilters);
    sortOrder.addEventListener('change', applyFilters);
});
