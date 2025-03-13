// frontend/js/transport-guidance.js
document.addEventListener('DOMContentLoaded', function() {
    const tripData = JSON.parse(sessionStorage.getItem('tripData'));
    if (!tripData) {
        document.querySelector('.container').innerHTML = `
            <div class="alert alert-warning">
                Please plan your trip first.
                <a href="trip-planner.html" class="btn btn-primary mt-3">Go to Trip Planner</a>
            </div>
        `;
        return;
    }
    
    // Add event listeners to transport option buttons
    const transportButtons = document.querySelectorAll('.btn-custom');
    transportButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const transportType = this.getAttribute('data-type');
            try {
                const response = await fetch(`/api/transport?type=${transportType}&destination=${encodeURIComponent(tripData.destination)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch transport options');
                }
                
                const data = await response.json();
                showTransportOptions(transportType, data.options);
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to fetch transport options. Please try again.');
            }
        });
    });
});

function showTransportOptions(type, options) {
    // Create a modal to display transport options
    const modalId = 'transportModal';
    
    // Remove existing modal if any
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${type.charAt(0).toUpperCase() + type.slice(1)} Options</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${options.length === 0 ? '<p>No options available for this transport type.</p>' : ''}
                        <div class="list-group">
                            ${options.map(option => `
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="mb-1">${option.name}</h5>
                                        <span class="badge bg-primary rounded-pill">₹${option.price}</span>
                                    </div>
                                    <p class="mb-1">From: ${option.from} | To: ${option.to}</p>
                                    <p class="mb-1">Departure: ${option.departure} | Arrival: ${option.arrival}</p>
                                    <small>Duration: ${option.duration}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}