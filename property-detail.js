// Property detail page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadPropertyDetail();
    initializeContactModal();
});

function loadPropertyDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        window.location.href = 'properties.html';
        return;
    }
    
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
        window.location.href = 'properties.html';
        return;
    }
    
    displayPropertyDetail(property);
}

function displayPropertyDetail(property) {
    const container = document.getElementById('property-detail-content');
    if (!container) return;
    
    const formatPrice = (price, type) => {
        if (type === 'rent') {
            return `₹${price.toLocaleString('en-IN')}/month`;
        } else {
            if (price >= 10000000) {
                return `₹${(price / 10000000).toFixed(2)} Crore`;
            } else if (price >= 100000) {
                return `₹${(price / 100000).toFixed(2)} Lakh`;
            } else {
                return `₹${price.toLocaleString('en-IN')}`;
            }
        }
    };
    
    const thumbnailsHtml = property.images.length > 1 ? 
        property.images.map((img, index) => 
            `<div class="thumbnail ${index === 0 ? 'active' : ''}" style="background-image: url('${img}')" data-index="${index}"></div>`
        ).join('') : '';
    
    container.innerHTML = `
        <div class="property-hero">
            <div class="property-gallery">
                <div class="main-image" style="background-image: url('${property.images[0]}')" id="main-image"></div>
                ${property.images.length > 1 ? `
                    <div class="thumbnail-images">
                        ${thumbnailsHtml}
                    </div>
                ` : ''}
            </div>
        </div>
        
        <div class="property-info">
            <div class="property-main">
                <div class="property-title-section">
                    <h1>${property.title}</h1>
                    <div class="property-meta">
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${property.location}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tag"></i>
                            <span>${property.transactionType === 'sale' ? 'For Sale' : 'For Rent'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span>${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="property-price-section">
                    <div class="price">${formatPrice(property.price, property.transactionType)}</div>
                    <div class="price-note">
                        ${property.transactionType === 'rent' ? 'Monthly rent' : 'Total price'}
                    </div>
                </div>
                
                <div class="property-features">
                    <h2>Property Features</h2>
                    <div class="features-grid">
                        <div class="feature-item">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.area} sq ft</span>
                        </div>
                        ${property.bedrooms ? `
                            <div class="feature-item">
                                <i class="fas fa-bed"></i>
                                <span>${property.bedrooms} Bedrooms</span>
                            </div>
                        ` : ''}
                        ${property.bathrooms ? `
                            <div class="feature-item">
                                <i class="fas fa-bath"></i>
                                <span>${property.bathrooms} Bathrooms</span>
                            </div>
                        ` : ''}
                        <div class="feature-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Listed ${formatDate(property.submittedAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="property-description">
                    <h2>Description</h2>
                    <p>${property.description}</p>
                </div>
                
                <div class="property-amenities-section">
                    <h2>Amenities</h2>
                    <div class="amenities-list">
                        ${property.amenities.map(amenity => `
                            <div class="amenity-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${amenity}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="property-sidebar">
                <div class="contact-card">
                    <h3>Contact Owner</h3>
                    <div class="owner-info">
                        <div class="owner-name">${property.ownerName}</div>
                        <div class="owner-phone">
                            <i class="fas fa-phone"></i>
                            ${property.ownerPhone}
                        </div>
                    </div>
                    <button class="contact-btn" onclick="openContactModal('${property.id}')">
                        <i class="fas fa-envelope"></i>
                        Send Message
                    </button>
                    <button class="favorite-btn" onclick="toggleFavorite('${property.id}')">
                        <i class="far fa-heart"></i>
                        Save to Favorites
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize image gallery
    if (property.images.length > 1) {
        initializeImageGallery(property.images);
    }
}

function initializeImageGallery(images) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            // Update main image
            mainImage.style.backgroundImage = `url('${images[index]}')`;
            
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });
}

function initializeContactModal() {
    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('close-contact-modal');
    const form = document.getElementById('contact-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

function openContactModal(propertyId) {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    if (!currentUser) {
        showNotification('Please login to contact property owner', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Pre-fill form with user data
    document.getElementById('contact-name').value = currentUser.name || '';
    document.getElementById('contact-email').value = currentUser.email || '';
    document.getElementById('contact-phone').value = currentUser.phone || '';
    
    const modal = document.getElementById('contact-modal');
    modal.classList.add('active');
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = Object.fromEntries(formData.entries());
    
    // Store contact inquiry (in real app, this would be sent to backend)
    const inquiries = JSON.parse(localStorage.getItem('settlespace_inquiries') || '[]');
    const newInquiry = {
        id: 'inquiry-' + Date.now(),
        ...contactData,
        propertyId: new URLSearchParams(window.location.search).get('id'),
        timestamp: new Date().toISOString()
    };
    
    inquiries.push(newInquiry);
    localStorage.setItem('settlespace_inquiries', JSON.stringify(inquiries));
    
    showNotification('Message sent successfully! Owner will contact you soon.', 'success');
    
    // Close modal
    const modal = document.getElementById('contact-modal');
    modal.classList.remove('active');
    
    // Reset form
    e.target.reset();
}

function toggleFavorite(propertyId) {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    if (!currentUser) {
        showNotification('Please login to save favorites', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    const favorites = JSON.parse(localStorage.getItem(`settlespace_favorites_${currentUser.id}`) || '[]');
    const index = favorites.indexOf(propertyId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Property removed from favorites', 'success');
    } else {
        favorites.push(propertyId);
        showNotification('Property added to favorites', 'success');
    }
    
    localStorage.setItem(`settlespace_favorites_${currentUser.id}`, JSON.stringify(favorites));
    
    // Update button icon
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');
    if (index > -1) {
        icon.className = 'far fa-heart';
    } else {
        icon.className = 'fas fa-heart';
    }
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
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
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