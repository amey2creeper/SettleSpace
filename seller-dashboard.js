// Seller dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkSellerAccess();
    loadSellerDashboard();
    initializePropertyForms();
});

function checkSellerAccess() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    if (!currentUser || currentUser.userType !== 'seller') {
        window.location.href = 'login.html';
        return;
    }
}

function loadSellerDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const userProperties = properties.filter(p => p.ownerId === currentUser.id);
    
    updateSellerStats(userProperties);
    displaySellerProperties(userProperties);
}

function updateSellerStats(userProperties) {
    const totalListings = userProperties.length;
    const activeListings = userProperties.filter(p => p.status === 'approved').length;
    const pendingListings = userProperties.filter(p => p.status === 'pending').length;
    const totalViews = userProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    
    document.getElementById('total-listings').textContent = totalListings;
    document.getElementById('active-listings').textContent = activeListings;
    document.getElementById('pending-listings').textContent = pendingListings;
    document.getElementById('total-views').textContent = totalViews;
}

function displaySellerProperties(userProperties) {
    const container = document.getElementById('properties-table');
    if (!container) return;
    
    if (userProperties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>No properties listed yet</h3>
                <p>Start by adding your first property</p>
            </div>
        `;
        return;
    }
    
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
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Listed Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${userProperties.map(property => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <img src="${property.images[0]}" alt="${property.title}" 
                                     style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${property.title}</div>
                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.location}</div>
                                </div>
                            </div>
                        </td>
                        <td>${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</td>
                        <td>${formatPrice(property.price, property.transactionType)}</td>
                        <td>
                            <span class="status-badge status-${property.status}">${property.status.charAt(0).toUpperCase() + property.status.slice(1)}</span>
                        </td>
                        <td>${formatDate(property.submittedAt)}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewProperty('${property.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-edit" onclick="editProperty('${property.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteProperty('${property.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function initializePropertyForms() {
    const addPropertyBtn = document.getElementById('add-property-btn');
    const addPropertyModal = document.getElementById('add-property-modal');
    const closeAddPropertyModal = document.getElementById('close-add-property-modal');
    const cancelAddProperty = document.getElementById('cancel-add-property');
    const addPropertyForm = document.getElementById('add-property-form');
    
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', () => {
            addPropertyModal.classList.add('active');
        });
    }
    
    if (closeAddPropertyModal) {
        closeAddPropertyModal.addEventListener('click', () => {
            addPropertyModal.classList.remove('active');
        });
    }
    
    if (cancelAddProperty) {
        cancelAddProperty.addEventListener('click', () => {
            addPropertyModal.classList.remove('active');
        });
    }
    
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', handleAddProperty);
    }
    
    // Initialize file upload preview
    const imageInput = document.getElementById('property-images');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
    
    // Close modal when clicking outside
    if (addPropertyModal) {
        addPropertyModal.addEventListener('click', (e) => {
            if (e.target === addPropertyModal) {
                addPropertyModal.classList.remove('active');
            }
        });
    }
}

function handleImagePreview(e) {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (files.length > maxFiles) {
        showNotification(`You can only upload maximum ${maxFiles} images`, 'error');
        e.target.value = '';
        return;
    }
    
    // Preview images (in a real app, you'd show thumbnails)
    console.log('Selected files:', files.map(f => f.name));
}

function handleAddProperty(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user'));
    const formData = new FormData(e.target);
    const images = Array.from(formData.getAll('images'));
    
    // In a real app, images would be uploaded to a server
    // For demo, we'll use placeholder images
    const placeholderImages = [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ];
    
    const newProperty = {
        id: 'prop-' + Date.now() + Math.random().toString(36).substr(2, 9),
        title: formData.get('title'),
        description: formData.get('description'),
        propertyType: formData.get('property_type'),
        transactionType: formData.get('transaction_type'),
        price: parseInt(formData.get('price')),
        area: parseInt(formData.get('area')),
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms')) : null,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms')) : null,
        location: formData.get('location'),
        amenities: formData.get('amenities') ? formData.get('amenities').split(',').map(a => a.trim()) : [],
        images: placeholderImages.slice(0, Math.max(1, images.length)),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerPhone: currentUser.phone,
        status: 'pending',
        paymentStatus: 'pending',
        submittedAt: new Date().toISOString(),
        views: 0,
        featured: false
    };
    
    // Save property
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    properties.push(newProperty);
    localStorage.setItem('settlespace_properties', JSON.stringify(properties));
    
    showNotification('Property added successfully! It will be reviewed by admin.', 'success');
    
    // Close modal and reset form
    document.getElementById('add-property-modal').classList.remove('active');
    e.target.reset();
    
    // Reload dashboard
    loadSellerDashboard();
}

function viewProperty(propertyId) {
    window.location.href = `property_detail.html?id=${propertyId}`;
}

function editProperty(propertyId) {
    // In a real app, this would open an edit modal with pre-filled form
    showNotification('Edit functionality will be available in the next version', 'info');
}

function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property?')) {
        return;
    }
    
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const updatedProperties = properties.filter(p => p.id !== propertyId);
    localStorage.setItem('settlespace_properties', JSON.stringify(updatedProperties));
    
    showNotification('Property deleted successfully', 'success');
    loadSellerDashboard();
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