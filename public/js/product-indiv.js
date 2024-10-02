import { addToCart } from './add-to-cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const userRole = localStorage.getItem('userRole');
    const productDetailsContainer = document.querySelector('.container');
    const openCartBtn = document.getElementById('open-cart-btn');
    const cart = document.getElementById('cart');

    let categoriesData = [];
    let subcategoriesData = [];

    function isMerchant() {
        return userRole === 'merchant' || userRole === 'commercant';
    }

    // Ajoutez un écouteur d'événement pour le bouton du panier
    if (openCartBtn && cart) {
        openCartBtn.addEventListener('click', function () {
            cart.classList.toggle('.open');
            adjustProductContainerMargin();
        });
    } else {
        console.error('Cart or open button not found');
    }

    // Fonction pour ajuster la marge du conteneur de détails du produit
    function adjustProductContainerMargin() {
        if (cart.classList.contains('.open')) {
            productDetailsContainer.style.transition = 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            productDetailsContainer.style.marginLeft = '390px';
        } else {
            productDetailsContainer.style.transition = 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            productDetailsContainer.style.marginLeft = '20px';
        }
    }

    // Fonction pour récupérer toutes les catégories
    function fetchCategories() {
        return fetch('/api/products/categories')
            .then(response => response.json())
            .then(data => {
                categoriesData = data.categories;
            })
            .catch(error => console.error('Erreur lors du chargement des catégories:', error));
    }

    // Fonction pour récupérer toutes les sous-catégories
    function fetchSubcategories() {
        return fetch('/api/products/subcategories')
            .then(response => response.json())
            .then(data => {
                subcategoriesData = data.subcategories;
            })
            .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
    }

    // Fonction pour obtenir le nom de la catégorie
    function getCategoryNameById(categoryId) {
        const category = categoriesData.find(cat => cat.categories_id === categoryId);
        return category ? category.categories_name : "Non spécifié";
    }

    // Fonction pour obtenir le nom de la sous-catégorie
    function getSubcategoryNameById(subcategoryId) {
        const subcategory = subcategoriesData.find(subcat => subcat.subcategory_id === subcategoryId);
        return subcategory ? subcategory.subcategory_name : "Non spécifié";
    }

    // Charger les catégories et sous-catégories dès que la page est prête
    Promise.all([fetchCategories(), fetchSubcategories()]).then(() => {
        if (productId) {
            fetch(`/api/products/${productId}`)
                .then(response => response.json())
                .then(data => {
                    const product = data.product;
                    const productDetails = document.getElementById('product-details');

                    if (product) {
                        const price = parseFloat(product.price);
                        const stockClass = product.stock > 0 ? 'stock-in' : 'stock-out';
                        const imageName = product.image_name_1 ? product.image_name_1 : `${product.name}.jpg`;

                        const categoryName = getCategoryNameById(product.category_id);
                        const subcategoryName = getSubcategoryNameById(product.subcategory_id);

                        productDetails.innerHTML = `
                            <div class="product-details-container">
                                <span class="close-product-details">&times;</span>
                                <div class="product-image">
                                    <img src="/images/${imageName}" alt="${product.name}" id="product-image">
                                    ${isMerchant() ? `<input type="file" id="image-upload" accept="image/*" style="display: block; margin-top: 10px;">` : ''}
                                </div>
                                <div class="product-info">
                                    <h1 class="product-name">${isMerchant() ? `<input type="text" id="product-name" value="${product.name}">` : product.name}</h1>
                                    <p class="product-description">${isMerchant() ? `<textarea id="product-description">${product.description}</textarea>` : product.description}</p>
                                    ${isMerchant() ? `<label for="product-price">Prix:</label><input type="number" id="product-price" value="${price.toFixed(2)}">` : `<p class="price"><strong>Prix:</strong> €${price.toFixed(2)}</p>`}
                                    <p class="stock-message ${stockClass}">${product.stock > 0 ? 'En stock' : 'Hors stock'}</p>
                                    ${isMerchant() ? `
                                        <label for="category-select">Catégorie:</label>
                                        <select id="category-select"></select>
                                        <label for="subcategory-select">Sous-catégorie:</label>
                                        <select id="subcategory-select"></select>
                                    ` : `
                                        <p class="product-category"><strong>Catégorie:</strong> ${categoryName}</p>
                                        <p class="product-subcategory"><strong>Sous-catégorie:</strong> ${subcategoryName}</p>
                                    `}
                                    <div class="purchase-options">
                                        <button class="buy-now-btn">Acheter maintenant</button>
                                        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${price}">Ajouter au panier</button>
                                        ${isMerchant() ? `<button class="save-changes-btn">Enregistrer les modifications</button>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;

                        if (isMerchant()) {
                            const imageUploadInput = document.getElementById('image-upload');
                            const saveChangesButton = document.querySelector('.save-changes-btn');

                            if (imageUploadInput) {
                                imageUploadInput.addEventListener('change', handleImageUpload);
                            }

                            if (saveChangesButton) {
                                saveChangesButton.addEventListener('click', saveChanges);
                            }

                            loadCategories(product.category_id);
                            loadSubcategories(product.subcategory_id);
                        }

                        const addToCartButton = productDetails.querySelector('.add-to-cart-btn');
                        if (addToCartButton) {
                            addToCartButton.addEventListener('click', addToCart);
                        }
                    } else {
                        console.log('Produit non trouvé.');
                        productDetails.innerHTML = '<p>Produit non trouvé.</p>';
                    }

                })
                .catch(error => console.error('Erreur lors du chargement des détails du produit:', error));
        } else {
            console.error('ID du produit manquant dans l\'URL');
        }
    });

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            const productId = urlParams.get('id');
            if (!productId) {
                alert('L\'ID du produit est manquant.');
                return;
            }

            formData.append('productId', productId);

            fetch('/api/products/update-image', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('product-image').src = `/images/${data.newImageName}`;
                    alert('Image mise à jour avec succès.');
                } else {
                    alert('Erreur lors de la mise à jour de l\'image.');
                }
            })
            .catch(error => console.error('Erreur lors de la mise à jour de l\'image:', error));
        }
    }

    function saveChanges() {
        const updatedName = document.getElementById('product-name').value;
        const updatedDescription = document.getElementById('product-description').value;
        const updatedCategoryId = document.getElementById('category-select').value;
        const updatedSubcategoryId = document.getElementById('subcategory-select').value;
        const updatedPrice = document.getElementById('product-price').value;


        fetch('/api/products/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: productId,
                name: updatedName,
                description: updatedDescription,
                category_id: updatedCategoryId,
                subcategory_id: updatedSubcategoryId,
                price: updatedPrice
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Modifications enregistrées avec succès.');
            } else {
                alert('Erreur lors de l\'enregistrement des modifications.');
            }
        })
        .catch(error => console.error('Erreur lors de l\'enregistrement des modifications:', error));
    }

    function loadCategories(selectedCategoryId) {
        const categorySelect = document.getElementById('category-select');
        if (categorySelect) {
            categorySelect.innerHTML = ''; // Clear previous options
            categoriesData.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categories_id;
                option.textContent = category.categories_name;
                if (category.categories_id == selectedCategoryId) {
                    option.selected = true; // Set the selected category
                }
                categorySelect.appendChild(option);
            });
        } else {
            console.error('Élément category-select non trouvé.');
        }
    }

    function loadSubcategories(selectedSubcategoryId) {
        const subcategorySelect = document.getElementById('subcategory-select');
        if (subcategorySelect) {
            subcategorySelect.innerHTML = ''; // Clear previous options
            subcategoriesData.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.subcategory_id;
                option.textContent = subcategory.subcategory_name;
                if (subcategory.subcategory_id == selectedSubcategoryId) {
                    option.selected = true; // Set the selected subcategory
                }
                subcategorySelect.appendChild(option);
            });
        } else {
            console.error('Élément subcategory-select non trouvé.');
        }
    }
    adjustProductContainerMargin();
});

document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('close-product-details')) {
        window.location.href = '/'; // Redirige vers la page d'accueil
    }
});
