document.addEventListener('DOMContentLoaded', function() {

    // Ajouter un événement pour la croix
    document.getElementById('close-btn').addEventListener('click', function() {
    window.location.href = '/'; // Redirige vers la page d'accueil
    });

    document.getElementById('sign-in-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche l'envoi du formulaire par défaut
    
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
    
        // Vérifier que les mots de passe correspondent avant d'envoyer au serveur
        if (password !== confirmPassword) {
            showError('Les mots de passe ne correspondent pas.');
            return;
        }
    
        // Envoyer la requête POST avec les données du formulaire
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, confirmPassword })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Erreur inconnue');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showSuccessPopup();
            } else {
                showError(data.message || 'Erreur lors de l\'inscription');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showError(error.message || 'Une erreur est survenue.');
        });
    });

    function showSuccessPopup() {
        const popup = document.getElementById('signup-success-popup');
        if (popup) {
            popup.classList.remove('hidden');
                
            const closeButton = popup.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    popup.classList.add('hidden');
                });
            } else {
                console.error('Bouton de fermeture non trouvé');
            }
    
            setTimeout(() => {
                popup.classList.add('hidden');
                window.location.href = '/login'; // Redirige vers login
            }, 3000);
        } else {
            console.error('Pop-up non trouvée');
        }
    }
    
    

    function showError(message) {
        const errorElement = document.getElementById('signin-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';

            // Fermer le message d'erreur après 5 secondes
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);

        } else {
            console.error('Élément d\'erreur non trouvé');
        }
    }
});
