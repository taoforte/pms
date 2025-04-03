document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('startDate').valueAsDate = new Date();
    
    // Form submission
    document.getElementById('addMedForm').addEventListener('submit', addMedication);
    
    // Load medications on page load
    loadMedications();
});

async function loadMedications() {
    try {
        const response = await fetch('api/medications.php');
        const medications = await response.json();
        renderMedications(medications);
    } catch (error) {
        console.error('Error loading medications:', error);
    }
}

function renderMedications(medications) {
    const container = document.getElementById('medicationsList');
    container.innerHTML = '';
    
    medications.forEach(med => {
        const medCard = document.createElement('div');
        medCard.className = 'medication-card';
        medCard.innerHTML = `
            <div class="medication-header">
                <h3 class="medication-name">${med.name}</h3>
                <span class="active-status ${med.active ? '' : 'inactive'}">
                    ${med.active ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            <div class="medication-details">
                <div class="detail-item">
                    <div class="detail-label">Strength</div>
                    <div class="detail-value">${med.strength}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Form</div>
                    <div class="detail-value">${med.dosage_form}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value">${med.prescribed_qty}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Start Date</div>
                    <div class="detail-value">${med.start_date}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Instructions</div>
                <div class="detail-value">${med.instructions || 'None'}</div>
            </div>
            
            <div class="action-buttons">
                <button class="edit-btn" data-id="${med.med_id}">Edit</button>
            </div>
        `;

        // new 0.2
        addDeleteButton(medCard, med.med_id);
        
        container.appendChild(medCard);
    });
    
    // Add event listeners to all edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const medId = this.getAttribute('data-id');
            startEditing(medId);
        });
    });
}

async function addMedication(e) {
    e.preventDefault();
    
    const newMed = {
        name: document.getElementById('medName').value,
        dosage_form: document.getElementById('dosageForm').value,
        strength: document.getElementById('strength').value,
        prescribed_qty: document.getElementById('quantity').value,
        instructions: document.getElementById('instructions').value,
        start_date: document.getElementById('startDate').value
    };
    
    try {
        const response = await fetch('api/medications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMed)
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            // Clear form
            e.target.reset();
            document.getElementById('startDate').valueAsDate = new Date();
            
            // Reload medications
            loadMedications();
        }
    } catch (error) {
        console.error('Error adding medication:', error);
    }
}

function startEditing(medId) {
    // You would implement similar to React version
    // Would need to fetch the specific medication and show edit form
    handleEdit(medId);
    console.log('Editing medication ID:', medId);
    // Implement similar to the React version but with DOM manipulation
}

// Add this function to your existing code
async function handleEdit(medId) {
    // Find the medication card
    const medCard = document.querySelector(`[data-id="${medId}"]`);
    
    // Get current values from the card
    const currentMed = {
        med_id: medId,
        name: medCard.querySelector('.medication-name').textContent,
        dosage_form: medCard.querySelector('.detail-value:nth-of-type(2)').textContent,
        strength: medCard.querySelector('.detail-value:first-child').textContent,
        prescribed_qty: medCard.querySelector('.detail-value:nth-of-type(3)').textContent,
        start_date: medCard.querySelector('.detail-value:nth-of-type(4)').textContent,
        instructions: medCard.querySelector('.detail-value:last-child').textContent,
        active: medCard.querySelector('.active-status').textContent === 'Active'
    };

    // Show edit form (you can use a modal or inline form)
    const newName = prompt("Medication Name:", currentMed.name);
    if (newName === null) return; // User cancelled
    
    const newStrength = prompt("Strength:", currentMed.strength);
    const newInstructions = prompt("Instructions:", currentMed.instructions === 'None' ? '' : currentMed.instructions);
    
    try {
        const response = await fetch('api/medications.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                med_id: medId,
                name: newName,
                dosage_form: currentMed.dosage_form, // Keep existing or add prompt
                strength: newStrength,
                prescribed_qty: currentMed.prescribed_qty, // Keep existing or add prompt
                instructions: newInstructions,
                start_date: currentMed.start_date, // Keep existing or add prompt
                active: currentMed.active // Keep existing or add prompt
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update medication');
        }
        
        // Refresh the list or update the card directly
        loadMedications();
        alert('Medication updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        alert('Error updating medication: ' + error.message);
    }
}



// new 0.2
function addDeleteButton(medCard, medId) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
        if (confirm('Are you sure you want to delete this medication?')) {
            try {
                const response = await fetch(`api/medications.php?id=${medId}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to delete');
                }
                
                medCard.remove(); // Remove from UI immediately
                showNotification('Medication deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                showNotification(error.message, 'error');
            }
        }
    };
    medCard.querySelector('.action-buttons').appendChild(deleteBtn);
}

// v0.3_edit_rec
