// Add your Moolre API credentials here
const MOOLRE_API_USER = 'YOUR_API_USER';
const MOOLRE_API_KEY = 'YOUR_API_KEY';
const MOOLRE_API_PUBKEY = 'YOUR_API_PUBKEY';
const MOOLRE_API_VASKEY = 'YOUR_API_VASKEY';


// API Endpoints (replace with actual endpoints if different)
const API_BASE_URL = 'https://api.moolre.com';
const VALIDATE_NAME_URL = `${API_BASE_URL}/v1/transfer/validate`; // Example endpoint
const DISBURSE_FUNDS_URL = `${API_BASE_URL}/v1/transfer/disburse`; // Example endpoint
const SEND_SMS_URL = `${API_BASE_URL}/v1/sms/send`; // Example endpoint

const disburseForm = document.getElementById('disburse-form');
const smsStatus = document.getElementById('sms-status');

// --- API Helper Function ---
async function fetchMoolreAPI(url, body) {
    const headers = {
        'Content-Type': 'application/json',
        'X-API-USER': MOOLRE_API_USER,
        'X-API-KEY': MOOLRE_API_KEY,
        'X-API-PUBKEY': MOOLRE_API_PUBKEY,
        'X-API-VASKEY': MOOLRE_API_VASKEY,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}


// --- Name Validation ---
accountNumberInput.addEventListener('blur', async () => {
    const accountNumber = accountNumberInput.value;
    if (!accountNumber) return;
    accountNameInput.value = 'Validating...';


    try {
        const data = await fetchMoolreAPI(VALIDATE_NAME_URL, {
            account_number: accountNumber,
            // Add other required parameters for validation based on API docs
        });

        if (data.status === 1) { // Assuming status 1 is success
            accountNameInput.value = data.data.account_name; // Adjust based on actual response
        } else {
            accountNameInput.value = `Validation failed: ${data.message}`;
        }
    } catch (error) {
        console.error('Name validation error:', error);
        accountNameInput.value = 'Error validating name';
    }
});


// --- Fund Disbursement ---
disburseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus('disburse-status', 'Processing...', 'processing');

    const body = {
        account_number: document.getElementById('disburse-account-number').value,
        amount: document.getElementById('disburse-amount').value,
        // Add other required parameters for disbursement based on API docs
    };

    try {
        const data = await fetchMoolreAPI(DISBURSE_FUNDS_URL, body);
        if (data.status === 1) {
            updateStatus('disburse-status', `Success: ${data.message}`, 'success');
        } else {
            updateStatus('disburse-status', `Failure: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Disbursement error:', error);
        updateStatus('disburse-status', 'An error occurred during disbursement.', 'error');
    }
});

// --- Send SMS ---
smsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus('sms-status', 'Sending...', 'processing');

    const body = {
        to: document.getElementById('sms-recipient').value,
        message: document.getElementById('sms-message').value,
        // Add other required parameters for SMS based on API docs
    };

    try {
        const data = await fetchMoolreAPI(SEND_SMS_URL, body);
        if (data.status === 1) {
            updateStatus('sms-status', `Success: ${data.message}`, 'success');
        } else {
            updateStatus('sms-status', `Failure: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('SMS error:', error);
        updateStatus('sms-status', 'An error occurred while sending SMS.', 'error');
    }
});

function updateStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    statusElement.textContent = message;
    statusElement.className = ''; // Reset classes
    statusElement.classList.add(`status-${type}`);
}

// --- Webhook Simulation ---
const simulateCallbackBtn = document.getElementById('simulate-callback-btn');
const webhookList = document.getElementById('webhook-list');

simulateCallbackBtn.addEventListener('click', () => {
    // This is a sample payload. The actual payload from Moolre might be different.
    const samplePayload = {
        status: 1,
        code: "000",
        message: "Transaction successful",
        data: {
            transaction_id: `txn_${Date.now()}`,
            amount: (Math.random() * 100).toFixed(2),
            currency: "GHS",
            customer_name: "Test Customer",
            payment_id: "pid_12345"
        }
    };

    handleWebhook(samplePayload);
});

function handleWebhook(payload) {
    const listItem = document.createElement('li');
    
    if (payload.status === 1) {
        const data = payload.data;
        listItem.innerHTML = `
            <strong>Payment Received!</strong><br>
            Transaction ID: ${data.transaction_id}<br>
            Amount: ${data.currency} ${data.amount}<br>
            From: ${data.customer_name}
        `;
    } else {
        listItem.innerHTML = `
            <strong>Transaction Failed</strong><br>
            Message: ${payload.message}
        `;
        listItem.style.borderLeftColor = '#dc3545'; // Red for failed
    }

    webhookList.prepend(listItem);
}