
        const { jsPDF } = window.jspdf;
        
        document.addEventListener('DOMContentLoaded', function() {
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('invoice-date').value = today;
            
            // Initialize items array
            let items = [];
            
            // DOM elements
            const itemsTbody = document.getElementById('items-tbody');
            const addItemBtn = document.getElementById('add-item-btn');
            const printBtn = document.getElementById('print-btn');
            const clearBtn = document.getElementById('clear-btn');
            const saveBtn = document.getElementById('save-btn');
            
            // Add item function
            function addItem() {
                const newItem = {
                    id: Date.now(),
                    description: '',
                    quantity: 1,
                    rate: 0,
                    amount: 0
                };
                items.push(newItem);
                renderItems();
            }
            
            // Render items in table
            function renderItems() {
                itemsTbody.innerHTML = '';
                
                items.forEach((item, index) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td><input type="text" class="item-desc" data-id="${item.id}" value="${item.description}"></td>
                        <td><input type="number" class="item-qty" data-id="${item.id}" value="${item.quantity}" min="1"></td>
                        <td><input type="number" class="item-rate" data-id="${item.id}" value="${item.rate}" min="0" step="0.01"></td>
                        <td class="item-amount">${item.amount.toFixed(2)}</td>
                        <td><button class="delete-item-btn" data-id="${item.id}">×</button></td>
                    `;
                    itemsTbody.appendChild(tr);
                });
                
                // Add event listeners to inputs
                document.querySelectorAll('.item-desc').forEach(input => {
                    input.addEventListener('input', updateItem);
                });
                
                document.querySelectorAll('.item-qty').forEach(input => {
                    input.addEventListener('input', updateItem);
                });
                
                document.querySelectorAll('.item-rate').forEach(input => {
                    input.addEventListener('input', updateItem);
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-item-btn').forEach(button => {
                    button.addEventListener('click', deleteItem);
                });
                
                calculateTotals();
            }
            
            // Update item function
            function updateItem(e) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const item = items.find(item => item.id === id);
                
                if (e.target.classList.contains('item-desc')) {
                    item.description = e.target.value;
                } else if (e.target.classList.contains('item-qty')) {
                    item.quantity = parseInt(e.target.value) || 0;
                } else if (e.target.classList.contains('item-rate')) {
                    item.rate = parseFloat(e.target.value) || 0;
                }
                
                item.amount = item.quantity * item.rate;
                calculateTotals();
            }
            
            // Delete item function
            function deleteItem(e) {
                const id = parseInt(e.target.getAttribute('data-id'));
                items = items.filter(item => item.id !== id);
                renderItems();
            }
            
            // Calculate totals function
            function calculateTotals() {
                // Update amounts in table
                items.forEach(item => {
                    const amountCell = document.querySelector(`.item-amount[data-id="${item.id}"]`);
                    if (amountCell) {
                        amountCell.textContent = item.amount.toFixed(2);
                    }
                });
                
                // Calculate subtotal
                const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
                document.getElementById('subtotal').textContent = subtotal.toFixed(2);
                
                // Calculate tax
                const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
                const taxAmount = subtotal * (taxRate / 100);
                document.getElementById('tax-amount').textContent = taxAmount.toFixed(2);
                
                // Calculate discount
                const discount = parseFloat(document.getElementById('discount').value) || 0;
                const discountAmount = discount;
                document.getElementById('discount-amount').textContent = discountAmount.toFixed(2);
                
                // Calculate grand total
                const grandTotal = subtotal + taxAmount - discountAmount;
                document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
            }
            
            // Print function
            function printInvoice() {
                window.print();
            }
            
            // Save as PDF function
            function saveAsPDF() {
                // Create new PDF document
                const doc = new jsPDF();
                
                // Add logo or title
                doc.setFontSize(20);
                doc.text('VISION', 105, 20, { align: 'center' });
                doc.setFontSize(12);
                
                // Company information
                const companyName = document.getElementById('company-name').value;
                const companyAddress = document.getElementById('company-address').value.split('\n');
                const companyPhone = document.getElementById('company-phone').value;
                const companyEmail = document.getElementById('company-email').value;
                
                doc.text(companyName, 14, 30);
                companyAddress.forEach((line, index) => {
                    doc.text(line, 14, 40 + (index * 5));
                });
                doc.text(`Phone: ${companyPhone}`, 14, 40 + (companyAddress.length * 5));
                doc.text(`Email: ${companyEmail}`, 14, 45 + (companyAddress.length * 5));
                
                // Client information
                const invoiceNumber = document.getElementById('invoice-number').value;
                const invoiceDate = document.getElementById('invoice-date').value;
                const clientName = document.getElementById('client-name').value;
                const clientAddress = document.getElementById('client-address').value.split('\n');
                
                doc.text(`Invoice #: ${invoiceNumber}`, 140, 30);
                doc.text(`Date: ${invoiceDate}`, 140, 35);
                doc.text(`Client: ${clientName}`, 140, 40);
                clientAddress.forEach((line, index) => {
                    doc.text(line, 140, 45 + (index * 5));
                });
                
                // Add line separator
                doc.line(14, 60 + (companyAddress.length * 5), 196, 60 + (companyAddress.length * 5));
                
                // Prepare items data for PDF
                const itemsData = items.map((item, index) => [
                    index + 1,
                    item.description,
                    item.quantity,
                    `₹${item.rate.toFixed(2)}`,
                    `₹${item.amount.toFixed(2)}`
                ]);
                
                // Add items table
                doc.autoTable({
                    startY: 70 + (companyAddress.length * 5),
                    head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
                    body: itemsData,
                    margin: { left: 14 },
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [44, 62, 80] }
                });
                
                // Add totals
                const subtotal = document.getElementById('subtotal').textContent;
                const taxAmount = document.getElementById('tax-amount').textContent;
                const taxRate = document.getElementById('tax-rate').value;
                const discountAmount = document.getElementById('discount-amount').textContent;
                const grandTotal = document.getElementById('grand-total').textContent;
                const notes = document.getElementById('notes').value;
                
                const lastY = doc.lastAutoTable.finalY + 10;
                
                doc.text(`Subtotal: ₹${subtotal}`, 160, lastY);
                doc.text(`Tax (${taxRate}%): ₹${taxAmount}`, 160, lastY + 5);
                doc.text(`Discount: ₹${discountAmount}`, 160, lastY + 10);
                doc.setFontSize(14);
                doc.text(`Total: ₹${grandTotal}`, 160, lastY + 17);
                doc.setFontSize(12);
                
                // Add notes if any
                if (notes) {
                    doc.text('Notes:', 14, lastY + 25);
                    doc.text(notes, 14, lastY + 30);
                }
                
                // Save the PDF
                doc.save(`Invoice_${invoiceNumber}.pdf`);
            }
            
            // Clear all function
            function clearAll() {
                if (confirm('Are you sure you want to clear the entire invoice?')) {
                    items = [];
                    document.getElementById('client-name').value = '';
                    document.getElementById('client-address').value = '';
                    document.getElementById('notes').value = '';
                    renderItems();
                }
            }
            
            // Event listeners
            addItemBtn.addEventListener('click', addItem);
            printBtn.addEventListener('click', printInvoice);
            saveBtn.addEventListener('click', saveAsPDF);
            clearBtn.addEventListener('click', clearAll);
            
            // Tax and discount change listeners
            document.getElementById('tax-rate').addEventListener('input', calculateTotals);
            document.getElementById('discount').addEventListener('input', calculateTotals);
            
            // Add first item by default
            addItem();
        });
        // Add this function to generate QR code
function generateQRCode() {
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const grandTotal = document.getElementById('grand-total').textContent;
    const clientName = document.getElementById('client-name').value || 'No Name';
    
    const qrData = `Invoice: ${invoiceNumber}\nDate: ${invoiceDate}\nClient: ${clientName}\nAmount: ₹${grandTotal}`;
    
    const qrCodeElement = document.getElementById('qr-code');
    qrCodeElement.innerHTML = ''; // Clear previous QR code
    
    QRCode.toCanvas(qrCodeElement, qrData, {
        width: 100,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) console.error(error);
    });
}

// Call this function whenever the bill changes
function updateQRCode() {
    calculateTotals();
    generateQRCode();
}

// Modify your existing event listeners to use updateQRCode instead of calculateTotals
document.getElementById('tax-rate').addEventListener('input', updateQRCode);
document.getElementById('discount').addEventListener('input', updateQRCode);

// Also update the saveAsPDF function to include the QR code
function saveAsPDF() {
    // ... existing code ...
    
    // Add QR code to PDF
    const qrCanvas = document.querySelector('#qr-code canvas');
    if (qrCanvas) {
        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', 160, lastY + 25, 30, 30);
    }
    
    // ... rest of existing code ...
}

// Generate initial QR code when page loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Add this at the end of the event listener
    generateQRCode();
    
    // Update all your item-related functions to call updateQRCode instead of calculateTotals
    // For example:
    function renderItems() {
        // ... existing code ...
        updateQRCode(); // instead of calculateTotals()
    }
    
    function updateItem(e) {
        // ... existing code ...
        updateQRCode(); // instead of calculateTotals()
    }
    
    function deleteItem(e) {
        // ... existing code ...
        updateQRCode(); // instead of calculateTotals()
    }
});