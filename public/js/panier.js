// Fonction pour ouvrir et fermer le panier
function toggleCart() {
    const cart = document.getElementById('cart');
    const openCartBtn = document.getElementById('open-cart-btn');

    // Vérifiez que l'élément 'cart' et 'openCartBtn' existent
    if (!cart || !openCartBtn) {
        console.error('Element with id "cart" or "open-cart-btn" not found in the DOM');
        return;
    }

    // Vérifiez si nous sommes sur la page product-indiv.html
    const isProductIndivPage = window.location.pathname.includes('product-indiv');

    if (!isProductIndivPage) {
        const productListContainer = document.getElementById('submain');
        
        if (!productListContainer) {
            console.warn('Element with id "submain" not found in the DOM');
            return;
        }

        if (cart.classList.contains('open')) {
            cart.classList.remove('open');
            openCartBtn.textContent = '🛒 Ouvrir le Panier';

            // Revenir à la marge initiale lorsque le panier est fermé
            productListContainer.style.transition = 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            productListContainer.style.marginLeft = '0px';
        } else {
            cart.classList.add('open');
            openCartBtn.textContent = 'Fermer le Panier';

            // Décaler le contenu vers la droite lorsque le panier est ouvert
            productListContainer.style.transition = 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            productListContainer.style.marginLeft = '390px';
        }
    } else {
        // Comportement spécifique à la page product-indiv.html
        if (cart.classList.contains('open')) {
            cart.classList.remove('open');
            openCartBtn.textContent = '🛒 Ouvrir le Panier';
        } else {
            cart.classList.add('open');
            openCartBtn.textContent = 'Fermer le Panier';
        }
    }
}

// Vérifier si nous sommes sur la page product-indiv.html
const isProductIndivPage = window.location.pathname.includes('product-indiv');

// Ajouter l'écouteur d'événement pour ouvrir/fermer le panier
const openCartBtn = document.getElementById('open-cart-btn');
if (openCartBtn) {
    openCartBtn.addEventListener('click', toggleCart);
} else {
    console.error('Element with id "open-cart-btn" not found in the DOM');
}

// Ajouter l'écouteur d'événement pour fermer le panier lorsqu'on clique en dehors, seulement si nous ne sommes pas sur product-indiv.html
if (!isProductIndivPage) {
    document.addEventListener('click', function(event) {
        const cart = document.getElementById('cart');
        const productListContainer = document.getElementById('product-list');

        if (!cart) {
            console.error('Element with id "cart" not found in the DOM');
            return;
        }

        if (!cart.contains(event.target) && !event.target.matches('#open-cart-btn')) {
            cart.classList.remove('open');
            document.getElementById('open-cart-btn').textContent = '🛒 Ouvrir le Panier';

            // Revenir à la marge initiale lorsque le panier est fermé
            if (productListContainer) {
                productListContainer.style.transition = 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                productListContainer.style.marginLeft = '0px';
            }
        }
    });
}

// Empêcher la fermeture du panier lorsqu'on clique à l'intérieur du panier
const cart = document.getElementById('cart');
if (cart) {
    cart.addEventListener('click', function(event) {
        event.stopPropagation(); // Empêche l'événement de propagation au document
    });
} else {
    console.error('Element with id "cart" not found in the DOM');
}
