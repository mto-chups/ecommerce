document.addEventListener('DOMContentLoaded', function() {
    fetchAllUsers();

    // Gestion de la recherche par email
    document.getElementById('search-email').addEventListener('input', filterUsersByEmail);

    // Gestion des en-têtes de tri
    document.querySelectorAll('#all-users-table thead th.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            const table = document.getElementById('all-users-table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Détecter l'ordre actuel et inverser
            const isAscending = header.classList.toggle('ascending');
            rows.sort((a, b) => {
                const cellA = a.querySelector(`td:nth-child(${Array.from(header.parentNode.children).indexOf(header) + 1})`).textContent.trim().toLowerCase();
                const cellB = b.querySelector(`td:nth-child(${Array.from(header.parentNode.children).indexOf(header) + 1})`).textContent.trim().toLowerCase();

                if (isAscending) {
                    return cellA.localeCompare(cellB);
                } else {
                    return cellB.localeCompare(cellA);
                }
            });

            // Réinsérer les lignes triées dans le tbody
            rows.forEach(row => tbody.appendChild(row));
        });
    });
});

function fetchAllUsers() {
    fetch('/api/users/all-users')
        .then(response => response.json())
        .then(data => {
            displayAllUsers(data.users);
        })
        .catch(error => console.error('Erreur lors de la récupération de tous les utilisateurs:', error));
}

function displayAllUsers(users) {
    const usersTableBody = document.querySelector('#all-users-table tbody');
    usersTableBody.innerHTML = ''; // Vider le contenu précédent

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button onclick="changeUserRole(${user.id}, '${user.role === 'client' ? 'commercant' : 'client'}')">
                    Passer à ${user.role === 'client' ? 'Commerçant' : 'Client'}
                </button>
                <button onclick="deleteUser(${user.id})" class="delete-btn">Supprimer</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Fonction pour supprimer un utilisateur
function deleteUser(userId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
        fetch(`/api/users/delete/${userId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Utilisateur supprimé avec succès');
                fetchAllUsers(); // Rafraîchir la liste des utilisateurs après suppression
            } else {
                alert('Erreur lors de la suppression de l\'utilisateur');
            }
        })
        .catch(error => console.error('Erreur lors de la suppression de l\'utilisateur:', error));
    }
}

// Fonction pour filtrer les utilisateurs par email
function filterUsersByEmail() {
    const searchInput = document.getElementById('search-email').value.toLowerCase();
    const rows = document.querySelectorAll('#all-users-table tbody tr');

    rows.forEach(row => {
        const email = row.children[1].textContent.toLowerCase();
        if (email.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
