export function addToCart(event) {
    const button = event.target;
    const product_id = event.target.getAttribute('data-id');
    const quantity = 1; // Vous pouvez permettre aux utilisateurs de choisir la quantité
    const productName = button.dataset.name;
    const productPrice = button.dataset.price;

    fetch('/api/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({product_id, quantity })
    })
    .then(response => response.json())
    .then(data => {
       // console.log(data.message);
        //alert(data.message);
        updateCartDisplay();
    })
    .catch(error => console.error('Erreur lors de l\'ajout au panier :', error));
}

//Check de la connexion du user
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    fetch('/api/auth/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Si l'utilisateur est connecté, mettre à jour l'affichage du panier
                updateCartDisplay();
            } else {
                console.log('Utilisateur non connecté, pas de mise à jour du panier');
            }
        })
        .catch(error => console.error('Erreur lors de la vérification de la session:', error));
});

// Fonction pour mettre à jour l'affichage du panier
function updateCartDisplay() {
    fetch('/api/cart/current')
        .then(response => {
            if (!response.ok) {
                throw new Error('Non autorisé');
            }
            return response.json();
        })
        .then(data => {
            const cartItemsList = document.getElementById('cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            cartItemsList.innerHTML = ''; // Effacer les éléments précédents

            if (Array.isArray(data.cart)) {
                let total = 0;

                data.cart.forEach(item => {
                    const price = parseFloat(item.price);
                    const listItem = document.createElement('li');
                    listItem.textContent = `${item.name} - Quantité: ${item.quantity} - Prix unitaire: ${price.toFixed(2)} €`;
                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'X';
                    removeButton.style.marginLeft = '10px';
                    removeButton.style.color = 'red';
                    removeButton.style.cursor = 'pointer';
                    removeButton.addEventListener('click', () => removeFromCart(item.product_id));

                    listItem.appendChild(removeButton);
                    cartItemsList.appendChild(listItem);

                    total += item.quantity * price;
                });

                cartTotalElement.textContent = `Total du panier: ${total.toFixed(2)} €`;
            } else {
                console.log('Pas de panier à afficher ou utilisateur non connecté');
                cartTotalElement.textContent = 'Votre panier est vide.';
            }
        })
        .catch(error => {
            if (error.message === 'Non autorisé') {
                console.log('Utilisateur non connecté, panier non chargé');
            } else {
                console.error('Erreur lors de la mise à jour du panier:', error);
            }
        });
}

// Fonction pour supprimer un produit du panier
function removeFromCart(product_id) {
    fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay(); // Mettre à jour l'affichage après la suppression
        } else {
            console.error('Erreur lors de la suppression de l\'article du panier:', data.message);
        }
    })
    .catch(error => console.error('Erreur lors de la suppression de l\'article du panier:', error));
}

// Appeler la fonction au chargement de la page pour initialiser le panier
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});

// Fonction pour vider le panier
function clearCart() {
    fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            updateCartDisplay(); // Mettre à jour l'affichage après avoir vidé le panier
        } else {
            console.error('Erreur lors du vidage du panier.');
        }
    })
    .catch(error => console.error('Erreur lors du vidage du panier:', error));
}

// Écouteur d'événement pour le bouton de vidage du panier
document.getElementById('clear-cart-btn').addEventListener('click', clearCart);

// Fonction pour commander
function placeOrder() {
    fetch('/api/cart/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Votre commande a été passée avec succès!');
            clearCart(); // Vider le panier après la commande
        } else {
            if (data.outOfStockItems && data.outOfStockItems.length > 0) {
                const outOfStockMessage = data.outOfStockItems.map(item => 
                    `Le produit : ${item.name} a été retiré du panier car il est en rupture de stock.`
                ).join('\n');
                alert(`Commande impossible:\n${outOfStockMessage}`);
                updateCartDisplay(); // Mettre à jour l'affichage du panier après la suppression
            } else {
                alert('Une erreur est survenue lors de la passation de la commande. Veuillez réessayer.');
            }
        }
    })
    .catch(error => console.error('Erreur lors de la commande:', error));
}


//Écouteur d'évènements pour le bouton de commande
document.getElementById('order-btn').addEventListener('click', placeOrder);
