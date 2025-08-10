// Profile page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkBuyerAccess();
    loadProfile();
    initializeProfileTabs();
    initializeProfileForms();
});

function checkBuyerAccess() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
}

function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    loadProfileInfo(currentUser);
    loadFavorites(currentUser);
    loadInquiries(currentUser);
    loadFurniture(currentUser);
}

function initializeProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function loadProfileInfo(user) {
    const container = document.getElementById('profile-info-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="profile-details">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="profile-data">
                <div class="profile-field">
                    <label>Full Name</label>
                    <span>${user.name}</span>
                </div>
                <div class="profile-field">
                    <label>Email Address</label>
                    <span>${user.email}</span>
                </div>
                <div class="profile-field">
                    <label>Phone Number</label>
                    <span>${user.phone || 'Not provided'}</span>
                </div>
                <div class="profile-field">
                    <label>Account Type</label>
                    <span class="status-badge status-approved">${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</span>
                </div>
                <div class="profile-field">
                    <label>Member Since</label>
                    <span>${formatDate(user.createdAt)}</span>
                </div>
                <div class="profile-field">
                    <label>Verification Status</label>
                    <span class="status-badge ${user.verified ? 'status-approved' : 'status-pending'}">
                        ${user.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                </div>
            </div>
        </div>
    `;
}

function loadFavorites(user) {
    const container = document.getElementById('favorites-grid');
    if (!container) return;
    
    const favorites = JSON.parse(localStorage.getItem(`settlespace_favorites_${user.id}`) || '[]');
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const favoriteProperties = properties.filter(p => favorites.includes(p.id));
    
    if (favoriteProperties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No favorite properties yet</h3>
                <p>Start browsing properties and save your favorites</p>
                <a href="properties.html" class="view-all-btn">Browse Properties</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="properties-grid">
            ${favoriteProperties.map(property => createPropertyCard(property, true)).join('')}
        </div>
    `;
    
    // Add click handlers
    container.querySelectorAll('.property-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                window.location.href = `property_detail.html?id=${favoriteProperties[index].id}`;
            }
        });
    });
}

function loadInquiries(user) {
    const container = document.getElementById('inquiries-table');
    if (!container) return;
    
    const inquiries = JSON.parse(localStorage.getItem('settlespace_inquiries') || '[]');
    const userInquiries = inquiries.filter(i => i.email === user.email);
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    
    if (userInquiries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>No inquiries sent yet</h3>
                <p>Contact property owners to start your property journey</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Message</th>
                    <th>Date Sent</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${userInquiries.map(inquiry => {
                    const property = properties.find(p => p.id === inquiry.propertyId);
                    return `
                        <tr>
                            <td>
                                ${property ? `
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${property.title}</div>
                                        <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.location}</div>
                                    </div>
                                ` : 'Property not found'}
                            </td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                                ${inquiry.message || 'No message'}
                            </td>
                            <td>${formatDate(inquiry.timestamp)}</td>
                            <td>
                                <span class="status-badge status-pending">Sent</span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function loadFurniture(user) {
    const container = document.getElementById('furniture-grid');
    const countEl = document.getElementById('furniture-count');
    if (!container) return;
    
    const furniture = JSON.parse(localStorage.getItem('settlespace_furniture') || '[]');
    const userFurniture = furniture.filter(f => f.sellerId === user.id);
    
    if (countEl) {
        countEl.textContent = `${userFurniture.length} items`;
    }
    
    if (userFurniture.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-couch"></i>
                <h3>No furniture listings yet</h3>
                <p>Start selling your furniture to earn extra income</p>
                <button class="view-all-btn" onclick="document.getElementById('add-furniture-btn').click()">
                    Add Furniture
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="furniture-items">
            ${userFurniture.map(item => createFurnitureCard(item)).join('')}
        </div>
    `;
}

function createPropertyCard(property, showRemove = false) {
    const formatPrice = (price, type) => {
        if (type === 'rent') {
            return `₹${price.toLocaleString('en-IN')}/month`;
        } else {
            if (price >= 10000000) {
                return `₹${(price / 10000000).toFixed(2)} Cr`;
            } else if (price >= 100000) {
                return `₹${(price / 100000).toFixed(2)} L`;
            } else {
                return `₹${price.toLocaleString('en-IN')}`;
            }
        }
    };
    
    return `
        <div class="property-card glass-card">
            <div class="property-image" style="background-image: url('${property.images[0]}')">
                <div class="property-badge">${property.transactionType === 'sale' ? 'For Sale' : 'For Rent'}</div>
                <div class="property-price">${formatPrice(property.price, property.transactionType)}</div>
                ${showRemove ? `
                    <button class="remove-favorite" onclick="removeFavorite('${property.id}')" title="Remove from favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                ` : ''}
            </div>
            <div class="property-content">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.location}
                </div>
                <div class="property-details">
                    ${property.bedrooms ? `<div class="property-detail"><i class="fas fa-bed"></i> ${property.bedrooms} BHK</div>` : ''}
                    ${property.bathrooms ? `<div class="property-detail"><i class="fas fa-bath"></i> ${property.bathrooms} Bath</div>` : ''}
                    ${property.area ? `<div class="property-detail"><i class="fas fa-ruler-combined"></i> ${property.area} sq ft</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

function createFurnitureCard(item) {
    const placeholderImage = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400';
    
    return `
        <div class="furniture-card glass-card">
            <div class="furniture-image" style="background-image: url('${item.images?.[0] || placeholderImage}')">
                <div class="furniture-price">₹${item.price.toLocaleString('en-IN')}</div>
                <div class="furniture-condition">${item.condition}</div>
            </div>
            <div class="furniture-content">
                <h3 class="furniture-title">${item.title}</h3>
                <div class="furniture-category">
                    <i class="fas fa-tag"></i>
                    ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </div>
                <div class="furniture-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${item.location}
                </div>
                <div class="furniture-actions">
                    <button class="action-btn btn-edit" onclick="editFurniture('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteFurniture('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initializeProfileForms() {
    // Edit Profile Modal
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
    const cancelEditProfile = document.getElementById('cancel-edit-profile');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    if (closeEditProfileModal) {
        closeEditProfileModal.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });
    }
    
    if (cancelEditProfile) {
        cancelEditProfile.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });
    }
    
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
    }
    
    // Add Furniture Modal
    const addFurnitureBtn = document.getElementById('add-furniture-btn');
    const addFurnitureModal = document.getElementById('add-furniture-modal');
    const closeAddFurnitureModal = document.getElementById('close-add-furniture-modal');
    const cancelAddFurniture = document.getElementById('cancel-add-furniture');
    const addFurnitureForm = document.getElementById('add-furniture-form');
    
    if (addFurnitureBtn) {
        addFurnitureBtn.addEventListener('click', () => {
            addFurnitureModal.classList.add('active');
        });
    }
    
    if (closeAddFurnitureModal) {
        closeAddFurnitureModal.addEventListener('click', () => {
            addFurnitureModal.classList.remove('active');
        });
    }
    
    if (cancelAddFurniture) {
        cancelAddFurniture.addEventListener('click', () => {
            addFurnitureModal.classList.remove('active');
        });
    }
    
    if (addFurnitureForm) {
        addFurnitureForm.addEventListener('submit', handleAddFurniture);
    }
    
    // Close modals when clicking outside
    [editProfileModal, addFurnitureModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });
}

function openEditProfileModal() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-phone').value = currentUser.phone || '';
    document.getElementById('edit-email').value = currentUser.email;
    
    document.getElementById('edit-profile-modal').classList.add('active');
}

function handleEditProfile(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    const formData = new FormData(e.target);
    
    // Update user data
    const updatedUser = {
        ...currentUser,
        name: formData.get('name'),
        phone: formData.get('phone')
    };
    
    // Update in localStorage
    localStorage.setItem('settlespace_user', JSON.stringify(updatedUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        localStorage.setItem('settlespace_users', JSON.stringify(users));
    }
    
    showNotification('Profile updated successfully!', 'success');
    
    // Close modal and reload profile
    document.getElementById('edit-profile-modal').classList.remove('active');
    loadProfileInfo(updatedUser);
}

function handleAddFurniture(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    const formData = new FormData(e.target);
    
    const newFurniture = {
        id: 'furniture-' + Date.now() + Math.random().toString(36).substr(2, 9),
        title: formData.get('title'),
        category: formData.get('category'),
        price: parseInt(formData.get('price')),
        condition: formData.get('condition'),
        description: formData.get('description'),
        location: formData.get('location'),
        images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400'], // Placeholder
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerPhone: currentUser.phone,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Save furniture
    const furniture = JSON.parse(localStorage.getItem('settlespace_furniture') || '[]');
    furniture.push(newFurniture);
    localStorage.setItem('settlespace_furniture', JSON.stringify(furniture));
    
    showNotification('Furniture listed successfully!', 'success');
    
    // Close modal and reload furniture
    document.getElementById('add-furniture-modal').classList.remove('active');
    e.target.reset();
    loadFurniture(currentUser);
}

function removeFavorite(propertyId) {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    const favorites = JSON.parse(localStorage.getItem(`settlespace_favorites_${currentUser.id}`) || '[]');
    const updatedFavorites = favorites.filter(id => id !== propertyId);
    
    localStorage.setItem(`settlespace_favorites_${currentUser.id}`, JSON.stringify(updatedFavorites));
    showNotification('Property removed from favorites', 'success');
    
    loadFavorites(currentUser);
}

function editFurniture(furnitureId) {
    showNotification('Edit furniture functionality will be available soon', 'info');
}

function deleteFurniture(furnitureId) {
    if (!confirm('Are you sure you want to delete this furniture listing?')) {
        return;
    }
    
    const furniture = JSON.parse(localStorage.getItem('settlespace_furniture') || '[]');
    const updatedFurniture = furniture.filter(f => f.id !== furnitureId);
    localStorage.setItem('settlespace_furniture', JSON.stringify(updatedFurniture));
    
    showNotification('Furniture listing deleted successfully', 'success');
    
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    loadFurniture(currentUser);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}