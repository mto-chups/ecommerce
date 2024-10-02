document.addEventListener('DOMContentLoaded', function() {
    const featuredBanner = document.getElementById('featured-products-banner');
    const submain = document.getElementById('submain');
    const searchInput = document.getElementById('search-products');

    // Fonction pour ajuster la marge de la liste de produits en fonction de la visibilité de la bannière
    function adjustsubmainMargin() {
        if (submain && featuredBanner) { // Vérifiez que les deux éléments existent
            if (featuredBanner.style.display !== 'none') {
                // Si la bannière est visible, retirer le margin-top de la liste de produits
                submain.style.marginTop = '0';
            } else {
                // Si la bannière n'est pas visible, restaurer le margin-top
                submain.style.marginTop = '145px'; // Ajustez cette valeur selon votre besoin
            }
        } else {
            console.warn('L\'élément product-list ou featured-banner n\'existe pas sur cette page.');
        }
    }

    // Attendre que les produits soient chargés avant d'ajouter des écouteurs d'événements
    document.addEventListener('productsLoaded', function() {
        const productCards = document.querySelectorAll('.product-card'); // Sélecteur de toutes les cartes de produit
        
        if (!searchInput) {
            console.warn('L\'élément de recherche de produits (input) est introuvable.');
            return;
        }

        if (productCards.length === 0) {
            console.warn('Aucune carte de produit trouvée pour appliquer la recherche.');
            return;
        }

        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();

            productCards.forEach(card => {
                const productNameElement = card.querySelector('h2');
                if (!productNameElement) {
                    console.warn('Élément de nom de produit introuvable dans la carte.');
                    return;
                }

                const productName = productNameElement.textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    card.style.display = 'block'; // Affiche la carte si elle correspond à la recherche
                } else {
                    card.style.display = 'none'; // Masque la carte si elle ne correspond pas
                }
            });
        });
    });

    // Fonction pour ajuster la marge de la liste de produits en fonction de la visibilité de la bannière
    function adjustsubmainMargin() {
        if (submain && featuredBanner) { // Vérifiez que les deux éléments existent
            if (featuredBanner.style.display !== 'none') {
                // Si la bannière est visible, retirer le margin-top de la liste de produits
                submain.style.marginTop = '0';
            } else {
                // Si la bannière n'est pas visible, restaurer le margin-top
                submain.style.marginTop = '145px'; // Ajustez cette valeur selon votre besoin
            }
        } else {
            console.warn('L\'élément product-list ou featured-banner n\'existe pas sur cette page.');
        }
    }

   

    // Appel initial pour ajuster les styles lors du chargement de la page, seulement si les éléments existent
    if (submain && featuredBanner) {
        adjustsubmainMargin();

        // Ajouter un écouteur d'événement pour surveiller les changements de visibilité de la bannière
        const observer = new MutationObserver(adjustsubmainMargin);
        observer.observe(featuredBanner, { attributes: true, attributeFilter: ['style'] });
    }

    // Optionnel: ajouter des boutons pour activer/désactiver la bannière pour tester
    const toggleBannerBtn = document.getElementById('toggle-banner-btn');
    if (toggleBannerBtn) {
        toggleBannerBtn.addEventListener('click', function () {
            if (featuredBanner.style.display === 'none') {
                featuredBanner.style.display = 'flex';
            } else {
                featuredBanner.style.display = 'none';
            }
            adjustsubmainMargin(); // Ajuster après chaque changement
        });
    }

    // Fonction utilitaire pour afficher ou masquer un élément
    function toggleElementVisibility(elementId, shouldShow) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = shouldShow ? 'block' : 'none';
        }
    }

    // Vérification de la session de l'utilisateur
    fetch('/api/auth/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Utilisateur connecté
                toggleElementVisibility('open-cart-btn', true);
                toggleElementVisibility('username-display', true);
                toggleElementVisibility('logout-button', true);
                toggleElementVisibility('open-login-popup', false);
                toggleElementVisibility('sign-in-button', false);

                // Afficher le nom d'utilisateur
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = `Bonjour, ${data.username}`;
                }

                // Afficher le bouton de tableau de bord si l'utilisateur est commerçant
                if (data.role === 'commercant') {
                    console.log('Affichage du bouton tableau de bord');
                    toggleElementVisibility('merchant-dashboard-button', true);
                }

            } else {
                // Utilisateur non connecté
                toggleElementVisibility('open-cart-btn', false);
                toggleElementVisibility('sign-in-button', true);
                toggleElementVisibility('open-login-popup', true);
                toggleElementVisibility('logout-button', false);
                toggleElementVisibility('username-display', false);
            }
        })
    .catch(error => console.error('Erreur lors de la vérification de la session:', error));
    // Récupérer les paramètres de la bannière au chargement de la page
    if (featuredBanner) {
        fetch('/api/banner-settings')
            .then(response => response.json())
            .then(settings => {
                if (settings.isActive) {
                    // Afficher la bannière et charger les produits
                    featuredBanner.style.display = 'flex';
                    
                    const productIds = [settings.product1, settings.product2, settings.product3];
                    productIds.forEach((productId, index) => {
                        fetch(`/api/products/${productId}`)
                            .then(response => response.json())
                            .then(productData => {
                                const productElement = document.getElementById(`featured-product-${index + 1}`);
                                if (productElement) {
                                    productElement.innerHTML = `
                                        <h3 style="color: var(--couleur1);">${productData.product.name}</h3>
                                        <img src="/images/${productData.product.image_name_1}" alt="${productData.product.name}" />
                                        <p style="color: var(--couleur1);">Prix: ${productData.product.price}€</p>
                                    `;
                                }
                            })
                            .catch(error => console.error('Erreur lors du chargement du produit:', error));
                    });
                } else {
                    // Masquer la bannière si elle n'est pas active
                    featuredBanner.style.display = 'none';
                    if (submain) {
                        submain.style.marginTop = '0';
                    }
                }
            })
            .catch(error => console.error('Erreur lors du chargement des paramètres de la bannière:', error));
    }
});

// Fonction de déconnexion
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem('authToken');  
            localStorage.removeItem('userRole');
            window.location.reload();
        }
    })
    .catch(error => console.error('Erreur lors de la déconnexion:', error));
}

function loadFeaturedProducts(product1Id, product2Id, product3Id) {
    console.log('Chargement des produits en vedette avec les IDs:', product1Id, product2Id, product3Id);

    [product1Id, product2Id, product3Id].forEach((productId, index) => {
        if (productId) {
            fetch(`/api/products/${productId}`)
                .then(response => response.json())
                .then(data => {
                    const product = data.product; // Vérifiez si 'product' est bien défini
                    
                    if (product) {
                        const imageUrl = product.image_name_1 
                            ? `/images/${product.image_name_1}` 
                            : `/images/${product.name}.jpg`;

                        const productElement = document.getElementById(`featured-product-${index + 1}`);
                        if (productElement) {
                            productElement.innerHTML = `
                                <h3>${product.name}</h3>
                                <img src="${imageUrl}" alt="${product.name}">
                                <p>${product.description}</p>
                                <button>Acheter maintenant</button>
                            `;
                        } else {
                            console.warn(`Élément de produit non trouvé pour l'ID ${productId} à l'index ${index + 1}`);
                        }
                    } else {
                        console.warn(`Produit non trouvé pour l'ID ${productId}`);
                    }
                })
                .catch(error => console.error('Erreur lors du chargement des produits en vedette:', error));
        } else {
            console.warn(`ID de produit non défini pour la bannière à l'index ${index + 1}`);
        }
    });
}