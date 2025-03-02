let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        alert('No cameras found');
    }
}).catch(function (e) {
    console.error(e);
});

scanner.addListener('scan', function (STUDENTID) {
    document.getElementById('text').value = STUDENTID; // Set input value
    processScan(STUDENTID); // Process scan
});

// Process Scan - Sends QR Code to PHP API
function processScan(qrCode) {
    console.log("📤 Sending QR Code to insert1.php:", qrCode); // Debugging

    axios.post('http://localhost/test/insert1.php', { text: qrCode }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function (response) {
        console.log("✅ API Response:", response.data); // Log response

        if (response.data.message) {
            showMessage(response.data.message, "success"); // Show success message
        } else if (response.data.error) {
            showMessage(response.data.error, "error"); // Show error message
            console.error("🚨 Insert Error:", response.data.error);
        }
    })
    .catch(function (error) {
        showMessage("Failed to insert data.", "error");
        console.error("❌ Error:", error);
    });
}

// Display success/error messages
function showMessage(message, type) {
    let messageDiv = document.getElementById('message');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '10px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.fontSize = '16px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '1000';
        document.body.appendChild(messageDiv);
    }

    messageDiv.style.backgroundColor = type === "success" ? "green" : "red";
    messageDiv.style.color = "white";
    messageDiv.innerText = message;

    setTimeout(() => { messageDiv.remove(); }, 3000);
}
