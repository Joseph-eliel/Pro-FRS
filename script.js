const { jsPDF } = window.jspdf;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize visual indicators
    updateVisualIndicators();
    
    // Add event listeners to inputs that affect visual indicators
    document.getElementById('R').addEventListener('input', updateVisualIndicators);
    document.getElementById('G').addEventListener('input', updateVisualIndicators);
    document.getElementById('D').addEventListener('input', updateVisualIndicators);
    
    // Calculate button event listener
    document.getElementById('calculate-btn').addEventListener('click', calculateMaintenance);
    
    // PDF button event listener
    document.getElementById('pdf-btn').addEventListener('click', generatePDFReport);
    
    // Reset button event listener
    document.getElementById('reset-btn').addEventListener('click', resetToDefault);
    
    // Sources button event listener
    document.getElementById('sources-btn').addEventListener('click', function() {
        document.getElementById('sources-modal').style.display = 'block';
    });
    
    // Close sources modal
    document.getElementById('close-sources').addEventListener('click', function() {
        document.getElementById('sources-modal').style.display = 'none';
    });
    
    // Contact link event listener
    document.getElementById('contact-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('contact-modal').style.display = 'block';
    });
    
    // Close contact modal
    document.querySelector('#contact-modal .close-button').addEventListener('click', function() {
        document.getElementById('contact-modal').style.display = 'none';
    });
    
    // Toggle About section
    document.getElementById('toggle-about').addEventListener('click', function() {
        toggleSection('toggle-about-content');
    });
    
    // Toggle Formula section
    document.getElementById('toggle-formula').addEventListener('click', function() {
        toggleSection('toggle-formula-content');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('sources-modal')) {
            document.getElementById('sources-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('contact-modal')) {
            document.getElementById('contact-modal').style.display = 'none';
        }
    });
    
    // Contact form submission
    document.querySelector('.contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        document.getElementById('contact-modal').style.display = 'none';
        this.reset();
    });
});

// Update visual indicators for R, G, and D inputs
function updateVisualIndicators() {
    const R = parseFloat(document.getElementById('R').value) || 1;
    const G = parseFloat(document.getElementById('G').value) || 0;
    const D = parseFloat(document.getElementById('D').value) || 1;
    
    // Update R marker (1-5 scale)
    const RPercent = ((R - 1) / 4) * 100;
    document.getElementById('R-marker').style.left = RPercent + '%';
    
    // Update G marker (0-100 scale)
    document.getElementById('G-marker').style.left = G + '%';
    
    // Update D marker (1-5 scale)
    const DPercent = ((D - 1) / 4) * 100;
    document.getElementById('D-marker').style.left = DPercent + '%';
}

// Update visual markers for R, G, D inputs
function updateVisualMarkers() {
    const R = parseFloat(document.getElementById('R').value) || 1;
    const G = parseFloat(document.getElementById('G').value) || 0;
    const D = parseFloat(document.getElementById('D').value) || 1;

    // Update R marker (1-5 scale)
    const RPercent = ((R - 1) / 4) * 100;
    document.getElementById('R-marker').style.left = `${RPercent}%`;

    // Update G marker (0-100 scale)
    document.getElementById('G-marker').style.left = `${G}%`;

    // Update D marker (1-5 scale)
    const DPercent = ((D - 1) / 4) * 100;
    document.getElementById('D-marker').style.left = `${DPercent}%`;
}

// Function to make markers draggable
function makeMarkerDraggable(markerId, inputId, minVal, maxVal, step = .1) {
    const marker = document.getElementById(markerId);
    const input = document.getElementById(inputId);
    const indicator = marker.parentElement;
    let isDragging = false;

    marker.addEventListener('mousedown', (e) => {
        isDragging = true;
        marker.style.cursor = 'grabbing';
        const startX = e.clientX;
        const startLeft = marker.offsetLeft;
        const indicatorWidth = indicator.offsetWidth;

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            let newLeft = startLeft + dx;

            // Constrain newLeft within indicator bounds
            newLeft = Math.max(0, Math.min(newLeft, indicatorWidth));

            const newPercent = (newLeft / indicatorWidth) * 100;
            marker.style.left = `${newPercent}%`;

            // Calculate new value for the input
            let newValue = (newPercent / 100) * (maxVal - minVal) + minVal;
            newValue = Math.round(newValue / step) * step; // Snap to step
            newValue = Math.max(minVal, Math.min(newValue, maxVal)); // Ensure within min/max

            input.value = newValue;
            updateDisplay(); // Update display based on new input value
        };

        const onMouseUp = () => {
            isDragging = false;
            marker.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    marker.style.cursor = 'grab'; // Set initial cursor style
}

// Apply draggable functionality to markers
makeMarkerDraggable('R-marker', 'R', 1, 5);
makeMarkerDraggable('G-marker', 'G', 0, 100);
makeMarkerDraggable('D-marker', 'D', 1, 5);

// Toggle section visibility
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const icon = content.previousElementSibling.querySelector('.toggle-icon');
    
    if (content.style.display === 'block') {
        content.style.display = 'none';
        icon.textContent = '▼';
    } else {
        content.style.display = 'block';
        icon.textContent = '▲';
    }
}

// Calculate maintenance interval using the formula
function calculateMaintenance() {
    // Get all input values
    const R = parseFloat(document.getElementById('R').value) || 0;
    const G = parseFloat(document.getElementById('G').value) || 0;
    const P = parseFloat(document.getElementById('P').value) || 0;
    const D = parseFloat(document.getElementById('D').value) || 0;
    const ADT = parseFloat(document.getElementById('ADT').value) || 0;
    const RF = parseFloat(document.getElementById('RF').value) || 0;
    
    // Get pothole dimensions
    const P_length = parseFloat(document.getElementById('P_length').value) || 0;
    const P_width = parseFloat(document.getElementById('P_width').value) || 0;
    const P_depth = parseFloat(document.getElementById('P_depth').value) || 0;
    
    // Calculate pothole volume (in thousands of Cm³)
    const P_volume = (P_length * P_width * P_depth * 0.6) / 1000;
    
    // Calculate road health score (numerator part of the formula)
    const healthScore = 100 - (2 * R) - (3 * (G / 100)) - (4 * P) - (0.8 * P_volume) - (3 * D);
    
    // Calculate deterioration rate (denominator part of the formula)
    const deteriorationRate = (0.1 * ADT) + (0.05 * RF);
    
    // Calculate time to maintenance in months
    let T = 0;
    if (deteriorationRate > 0) {
        T = healthScore / deteriorationRate;
    }
    
    // Ensure T is not negative
    T = Math.max(0, T);
    
    // Calculate days
    const totalDays = T * 30;
    const months = Math.floor(T);
    const days = Math.round((T - months) * 30);
    
    // Display results
    displayResults(T, months, days, totalDays, healthScore, deteriorationRate);
}

// Display calculation results
function displayResults(T, months, days, totalDays, healthScore, deteriorationRate) {
    const resultElement = document.getElementById('result');
    const monthsElement = document.getElementById('months-result');
    const daysElement = document.getElementById('days-result');
    const totalDaysElement = document.getElementById('total-days');
    const healthScoreElement = document.getElementById('health-score');
    const deteriorationRateElement = document.getElementById('deterioration-rate');
    
    // Format the main result
    let resultText = '';
    if (T === 0) {
        resultText = 'Immediate Maintenance Required';
        resultElement.className = 'result-value immediate';
    } else if (T < 6) {
        resultText = `${T.toFixed(1)} months (Urgent Attention Needed)`;
        resultElement.className = 'result-value urgent';
    } else if (T < 12) {
        resultText = `${T.toFixed(1)} months`;
        resultElement.className = 'result-value soon';
    } else {
        resultText = `${T.toFixed(1)} months (Good Condition)`;
        resultElement.className = 'result-value good';
    }
    
    resultElement.textContent = resultText;
    
    // Update breakdown
    monthsElement.innerHTML = `<strong>Months:</strong> ${months}`;
    daysElement.innerHTML = `<strong>Days:</strong> ${days}`;
    totalDaysElement.innerHTML = `<strong>Total:</strong> ${Math.round(totalDays)} days`;
    healthScoreElement.innerHTML = `<strong>Road Health Score:</strong> ${Math.max(0, healthScore).toFixed(1)}/100`;
    deteriorationRateElement.innerHTML = `<strong>Deterioration Rate:</strong> ${deteriorationRate.toFixed(2)} points/month`;
    
    // Show result container
    document.getElementById('result-container').style.display = 'block';
}

// Generate PDF Report
// Enhanced PDF Report Generator for Pro-FRS
// Includes: Charts, Images, Professional Styling, and Data Visualization

async function generatePDFReport() {
    try {
        // Get all input values with better extraction
        const resultText = document.getElementById('result')?.textContent?.trim() || 'N/A';
        const monthsResult = document.getElementById('months-result')?.textContent?.trim() || 'N/A';
        const daysResult = document.getElementById('days-result')?.textContent?.trim() || 'N/A';
        
        // Extract numeric value from total-days (handles "XXX days" format)
        const totalDaysText = document.getElementById('total-days')?.textContent?.trim() || '0';
        const totalDays = parseFloat(totalDaysText.replace(/[^0-9.]/g, '')) || 0;
        
        const healthScore = document.getElementById('health-score')?.textContent?.trim() || 'Road Health Score: N/A';
        const deteriorationRate = document.getElementById('deterioration-rate')?.textContent?.trim() || 'Deterioration Rate: N/A';

        // Location details
        const province = document.getElementById('province')?.value || 'Not specified';
        const district = document.getElementById('district')?.value || 'Not specified';
        const sector = document.getElementById('sector')?.value || 'Not specified';
        const roadFrom = document.getElementById('road-from')?.value || 'Not specified';
        const roadTo = document.getElementById('road-to')?.value || 'Not specified';
        const roadLength = document.getElementById('road-length')?.value || '0';
        const surfaceMaterial = document.getElementById('surface-material')?.value || 'Not specified';

        // Input parameters with validation
        const R = parseFloat(document.getElementById('R')?.value) || 0;
        const G = parseFloat(document.getElementById('G')?.value) || 0;
        const P = parseFloat(document.getElementById('P')?.value) || 0;
        const D = parseFloat(document.getElementById('D')?.value) || 0;
        const ADT = parseFloat(document.getElementById('ADT')?.value) || 0;
        const RF = parseFloat(document.getElementById('RF')?.value) || 0;
        
        // Validate that we have actual calculation results
        if (totalDays === 0 || isNaN(totalDays)) {
            alert('Please calculate maintenance timeline first before generating the PDF report.');
            return;
        }

        // Initialize PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        let yPos = 0;

        // ============ PAGE 1: COVER PAGE ============
        
        // Modern gradient header
        doc.setFillColor(26, 35, 126); // Deep blue
        doc.rect(0, 0, pageWidth, 80, 'F');
        
        // Add diagonal accent
        doc.setFillColor(13, 71, 161);
        doc.triangle(0, 50, 0, 80, 50, 80, 'F');
        doc.setFillColor(25, 118, 210);
        doc.triangle(pageWidth, 0, pageWidth, 30, pageWidth - 50, 0, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('ROAD MAINTENANCE', pageWidth / 2, 35, { align: 'center' });
        doc.text('ANALYSIS REPORT', pageWidth / 2, 47, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Proactive Feeder Road Scheduler (Pro-FRS)', pageWidth / 2, 60, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Highway Technologies - Predictive Maintenance System', pageWidth / 2, 67, { align: 'center' });

        // Road Information Card
        yPos = 95;
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(15, yPos, pageWidth - 30, 65, 3, 3, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ROAD DETAILS', 20, yPos + 10);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Route: ${roadFrom} to ${roadTo}`, 20, yPos + 20);
        doc.text(`Location: ${province}, ${district}, ${sector}`, 20, yPos + 28);
        doc.text(`Length: ${roadLength} km`, 20, yPos + 36);
        doc.text(`Surface Type: ${surfaceMaterial}`, 20, yPos + 44);
        
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.setFont('helvetica', 'italic');
        doc.text(`Report Generated: ${dateStr}`, 20, yPos + 56);

        // Urgency Status Badge
        yPos = 170;
        let statusColor, statusText, statusBg;
        if (totalDays < 30) {
            statusColor = [211, 47, 47];
            statusBg = [255, 235, 238];
            statusText = 'URGENT INTERVENTION REQUIRED';
        } else if (totalDays < 90) {
            statusColor = [245, 124, 0];
            statusBg = [255, 243, 224];
            statusText = 'PRIORITY MAINTENANCE NEEDED';
        } else {
            statusColor = [56, 142, 60];
            statusBg = [232, 245, 233];
            statusText = 'ROUTINE MAINTENANCE';
        }

        doc.setFillColor(...statusBg);
        doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, 'F');
        doc.setDrawColor(...statusColor);
        doc.setLineWidth(1);
        doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, 'S');
        
        doc.setTextColor(...statusColor);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, pageWidth / 2, yPos + 12, { align: 'center' });
        doc.setFontSize(20);
        doc.text(resultText, pageWidth / 2, yPos + 24, { align: 'center' });

        // Key Metrics Summary
        yPos = 215;
        
        const metrics = [
            { label: 'Maintenance Timeline', value: totalDays > 0 ? `${totalDays.toFixed(0)} days` : 'Calculate First' },
            { label: 'Road Health Score', value: healthScore.includes(':') ? healthScore.split(':')[1].trim() : healthScore },
            { label: 'Deterioration Rate', value: deteriorationRate.includes(':') ? deteriorationRate.split(':')[1].trim() : deteriorationRate }
        ];

        metrics.forEach((metric, idx) => {
            const xPos = 20 + (idx * 60);
            
            // Set white background for metric cards
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.roundedRect(xPos, yPos, 50, 30, 2, 2, 'FD');
            
            // Add subtle shadow effect
            doc.setDrawColor(240, 240, 240);
            doc.setLineWidth(2);
            doc.line(xPos + 1, yPos + 31, xPos + 49, yPos + 31);
            doc.line(xPos + 51, yPos + 2, xPos + 51, yPos + 30);
            
            // Label text
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(metric.label, xPos + 25, yPos + 10, { align: 'center' });
            
            // Value text
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const valueLines = doc.splitTextToSize(metric.value, 45);
            doc.text(valueLines, xPos + 25, yPos + 20, { align: 'center' });
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'italic');
        doc.text(`Pro-FRS v1.0 | Page 1 | Generated: ${dateStr}`, pageWidth / 2, 290, { align: 'center' });

        // ============ PAGE 2: TECHNICAL ANALYSIS ============
        doc.addPage();
        yPos = 20;

        // Header
        doc.setFillColor(26, 35, 126);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TECHNICAL ANALYSIS', pageWidth / 2, 10, { align: 'center' });

        // Formula Section
        yPos = 30;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Predictive Maintenance Formula', 15, yPos);
        
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(15, yPos + 5, pageWidth - 30, 25, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        doc.setTextColor(33, 33, 33);
        const formula = 'T = (100 - (2×R) - (3×(G/100)) - (4×P) - (0.8×P_vol) - (3×D))';
        const formula2 = '    / ((0.1×ADT) + (0.05×RF))';
        doc.text(formula, pageWidth / 2, yPos + 15, { align: 'center' });
        doc.text(formula2, pageWidth / 2, yPos + 22, { align: 'center' });

        // Input Parameters Table
        yPos = 70;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Road Condition Parameters', 15, yPos);

        yPos += 10;
        const params = [
            { name: 'Rutting Severity Index (R)', value: R.toFixed(2), unit: '', risk: R > 3 ? 'High' : R > 2 ? 'Medium' : 'Low' },
            { name: 'Gravel Loss (G)', value: G.toFixed(2), unit: '%', risk: G > 39 ? 'High' : G > 10 ? 'Medium' : 'Low' },
            { name: 'Pothole Density (P)', value: P.toFixed(2), unit: 'per 100m', risk: P > 15 ? 'High' : P > 6 ? 'Medium' : 'Low' },
            { name: 'Drainage Condition (D)', value: D.toFixed(2), unit: '', risk: D > 3.5 ? 'High' : D > 2.5 ? 'Medium' : 'Low' },
            { name: 'Average Daily Traffic (ADT)', value: ADT.toFixed(0), unit: 'vehicles/day', risk: ADT > 500 ? 'High' : 'Normal' },
            { name: 'Monthly Rainfall (RF)', value: RF.toFixed(2), unit: 'mm/month', risk: RF > 150 ? 'High' : 'Normal' }
        ];

        doc.setFillColor(26, 35, 126);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Parameter', 18, yPos + 5.5);
        doc.text('Value', 120, yPos + 5.5);
        doc.text('Risk Level', 160, yPos + 5.5);

        yPos += 8;
        params.forEach((param, idx) => {
            if (idx % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(15, yPos, pageWidth - 30, 10, 'F');
            }

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(param.name, 18, yPos + 7);
            doc.text(`${param.value} ${param.unit}`, 120, yPos + 7);
            
            // Risk badge
            const riskColors = {
                'High': [211, 47, 47],
                'Medium': [245, 124, 0],
                'Low': [56, 142, 60],
                'Normal': [66, 66, 66]
            };
            doc.setFillColor(...riskColors[param.risk]);
            doc.roundedRect(160, yPos + 2, 25, 6, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(param.risk, 172.5, yPos + 6.5, { align: 'center' });

            yPos += 10;
        });

        // Recommendations Section
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Maintenance Recommendations', 15, yPos);

        yPos += 5;
        doc.setFillColor(232, 245, 233);
        if (totalDays < 30) {
            doc.setFillColor(255, 235, 238);
        } else if (totalDays < 90) {
            doc.setFillColor(255, 243, 224);
        }
        doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');

        let interpretation = '';
        let actions = [];
        if (totalDays < 30) {
            interpretation = 'URGENT ACTION REQUIRED: The road shows critical deterioration indicators requiring immediate intervention to prevent safety hazards and further damage.';
            actions = [
                '• Deploy emergency maintenance crew within 7 days',
                '• Conduct detailed condition assessment',
                '• Implement traffic management measures if necessary',
                '• Prioritize drainage and pothole repairs'
            ];
        } else if (totalDays < 90) {
            interpretation = 'PRIORITY MAINTENANCE: Schedule maintenance within the next quarter to maintain serviceability and prevent accelerated deterioration.';
            actions = [
                '• Include in quarterly maintenance schedule',
                '• Prepare detailed work plan and budget',
                '• Conduct pre-maintenance survey',
                '• Coordinate with local authorities'
            ];
        } else {
            interpretation = 'ROUTINE MAINTENANCE: Road is in acceptable condition. Plan maintenance as part of regular cycle.';
            actions = [
                '• Include in annual maintenance plan',
                '• Continue periodic monitoring',
                '• Address minor defects proactively',
                '• Update condition records'
            ];
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const interpretLines = doc.splitTextToSize(interpretation, pageWidth - 40);
        doc.text(interpretLines, 20, yPos + 8);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Actions:', 20, yPos + 22);
        doc.setFont('helvetica', 'normal');
        actions.forEach((action, idx) => {
            doc.text(action, 20, yPos + 28 + (idx * 4.5));
        });

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'italic');
        doc.text(`Pro-FRS v1.0 | Page 2 | Generated: ${dateStr}`, pageWidth / 2, 290, { align: 'center' });

        // Save PDF
        const filename = `Road_Maintenance_Report_${roadFrom.replace(/\s+/g, '_')}_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`;
        doc.save(filename);

        // Success notification (if you have a notification system)
        console.log('PDF Report generated successfully!');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF report. Please check all required fields are filled.');
    }
}

// Export function for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePDFReport };
}


// Reset form to default values
function resetToDefault() {
    if (confirm('Are you sure you want to reset all values to default?')) {
        // Reset location details
        document.getElementById('province').value = 'northern';
        document.getElementById('district').value = 'Rulindo';
        document.getElementById('sector').value = 'Tumba';
        document.getElementById('road-from').value = '';
        document.getElementById('road-to').value = '';
        document.getElementById('road-length').value = '0';
        document.getElementById('surface-material').value = 'gravel';
        
        // Reset road condition parameters
        document.getElementById('R').value = '1';
        document.getElementById('G').value = '0';
        document.getElementById('P').value = '0';
        document.getElementById('D').value = '1';
        document.getElementById('P_length').value = '0';
        document.getElementById('P_width').value = '0';
        document.getElementById('P_depth').value = '0';
        
        // Reset environmental & traffic factors
        document.getElementById('ADT').value = '0';
        document.getElementById('RF').value = '0';
        
        // Update visual indicators
        updateVisualIndicators();
        
        // Clear results
        document.getElementById('result-container').style.display = 'none';
        document.getElementById('result').textContent = 'Enter parameters to calculate';
        
        alert('Form has been reset to default values.');
    }
}
