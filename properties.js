// Properties page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadPropertiesFromURL();
});

function loadPropertiesFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Apply URL parameters to filters
    if (urlParams.get('transaction_type')) {
        const el = document.getElementById('filter-transaction-type');
        if (el) el.value = urlParams.get('transaction_type');
    }
    
    if (urlParams.get('property_type')) {
        const el = document.getElementById('filter-property-type');
        if (el) el.value = urlParams.get('property_type');
    }
    
    if (urlParams.get('location')) {
        const el = document.getElementById('filter-location');
        if (el) el.value = urlParams.get('location');
    }
    
    if (urlParams.get('price_range')) {
        const el = document.getElementById('filter-price-range');
        if (el) el.value = urlParams.get('price_range');
    }
    
    // Apply filters if any parameters exist
    if (urlParams.toString()) {
        setTimeout(() => {
            if (typeof applyFilters === 'function') {
                applyFilters();
            }
        }, 100);
    }
}