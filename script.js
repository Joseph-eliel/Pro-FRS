const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
    const resultElement = document.getElementById('result');
    const monthsResultElement = document.getElementById('months-result');
    const daysResultElement = document.getElementById('days-result');
    const totalDaysElement = document.getElementById('total-days');
    const healthScoreElement = document.getElementById('health-score');
    const deteriorationRateElement = document.getElementById('deterioration-rate');
    const resultContainer = document.getElementById('result-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const sourcesBtn = document.getElementById('sources-btn');
    const sourcesModal = document.getElementById('sources-modal');
    const closeSources = document.getElementById('close-sources');
    const toggleAbout = document.getElementById('toggle-about');
    const toggleAboutLink = document.getElementById('toggle-about_link');
    const toggleAboutContent = document.getElementById('toggle-about-content');
    const toggleFormula = document.getElementById('toggle-formula');
    const toggleFormulaLink = document.getElementById('toggle-formula_link');
    const toggleFormulaContent = document.getElementById('toggle-formula-content');
    const toggleAboutIcon = toggleAbout.querySelector('.toggle-icon');
    const toggleFormulaIcon = toggleFormula.querySelector('.toggle-icon');
    
    // Toggle functionality for About This Tool
    toggleAbout.addEventListener('click', function() {
        toggleAboutContent.classList.toggle('active');
        toggleAboutIcon.textContent = toggleAboutContent.classList.contains('active') ? '▲' : '▼';
    });

    toggleAboutLink.addEventListener('click', function() {
        toggleAboutContent.classList.toggle('active');
        toggleAboutIcon.textContent = toggleAboutContent.classList.contains('active') ? '▲' : '▼';
    });
    
    // Toggle functionality for Formula Details
    toggleFormula.addEventListener('click', function() {
        toggleFormulaContent.classList.toggle('active');
        toggleFormulaIcon.textContent = toggleFormulaContent.classList.contains('active') ? '▲' : '▼';
    });
    
    toggleFormulaLink.addEventListener('click', function() {
        toggleFormulaContent.classList.toggle('active');
        toggleFormulaIcon.textContent = toggleFormulaContent.classList.contains('active') ? '▲' : '▼';
    });
    
    // Define color constants for JavaScript
    const colors = {
        primary: '#2c3e50',
        secondary: '#3498db',
        accent: '#e74c3c',
        warning: '#f39c12',
        success: '#27ae60'
    };
    
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

    // Function to calculate T and additional metrics
    function calculateMetrics() {
        // Get values from inputs
        const R = parseFloat(document.getElementById('R').value) || 0;
        const G = parseFloat(document.getElementById('G').value) || 0;
        const P = parseFloat(document.getElementById('P').value) || 0;
        const D = parseFloat(document.getElementById('D').value) || 0;
        const ADT = parseFloat(document.getElementById('ADT').value) || 0;
        const RF = parseFloat(document.getElementById('RF').value) || 0;
        
        // Validate ranges
        if (R < 1 || R > 5) {
            alert("Rutting Severity Index (R) must be between 1 and 5");
            document.getElementById('R').value = Math.max(1, Math.min(5, R));
            return calculateMetrics();
        }
        
        if (G < 0 || G > 100) {
            alert("Gravel Loss (G) must be between 0% and 100%");
            document.getElementById('G').value = Math.max(0, Math.min(100, G));
            return calculateMetrics();
        }
        
        if (D < 1 || D > 5) {
            alert("Drainage Condition Index (D) must be between 1 and 5");
            document.getElementById('D').value = Math.max(1, Math.min(5, D));
            return calculateMetrics();
        }
        
        // Calculate Road Health Score (Numerator)
        const healthScore = 100 - (2 * R) - (3 * (G / 100)) - (4 * P) - (3 * D);
        
        // Calculate Deterioration Rate (Denominator)
        const deteriorationRate = (0.1 * ADT) + (0.05 * RF);
        
        // Avoid division by zero
        if (deteriorationRate === 0) {
            return {
                months: "Undefined",
                days: "Undefined",
                totalDays: "Undefined",
                healthScore: healthScore.toFixed(2),
                deteriorationRate: deteriorationRate.toFixed(2)
            };
        }
        
        // Calculate T in months
        const T = healthScore / deteriorationRate;
        
        // Ensure T is not negative
        if (T < 0) {
            return {
                months: 0,
                days: 0,
                totalDays: 0,
                healthScore: healthScore.toFixed(2),
                deteriorationRate: deteriorationRate.toFixed(2),
                originalValue: 0
            };
        }
        
        // Convert decimal months to days (assuming 30 days per month)
        const months = Math.floor(T);
        const days = Math.round((T - months) * 30);
        const totalDays = Math.round(T * 30);
        
        return {
            months: months,
            days: days,
            totalDays: totalDays,
            healthScore: healthScore.toFixed(2),
            deteriorationRate: deteriorationRate.toFixed(2),
            originalValue: T
        };
    }
    
    // Function to update display
    function updateDisplay() {
        const result = calculateMetrics();
        updateVisualMarkers();
        
        if (result.months === "Undefined") {
            resultElement.textContent = "Enter parameters to calculate";
            monthsResultElement.textContent = "Months: -";
            daysResultElement.textContent = "Days: -";
            totalDaysElement.textContent = "Total: - days";
            healthScoreElement.textContent = "Road Health Score: -/100";
            deteriorationRateElement.textContent = "Deterioration Rate: - points/month";
            return;
        }
        
        // Format the main result
        if (result.months === 0 && result.days === 0) {
            resultElement.textContent = "0 months";
        } else if (result.months === 0) {
            resultElement.textContent = `${result.days} days`;
        } else if (result.days === 0) {
            resultElement.textContent = `${result.months} months`;
        } else {
            resultElement.textContent = `${result.months} months, ${result.days} days`;
        }
        
        // Update breakdown
        monthsResultElement.innerHTML = "<strong>Months:</strong> " + result.months;
        daysResultElement.innerHTML = "<strong>Days:</strong> " + result.days;
        totalDaysElement.innerHTML = "<strong>Total:</strong> " + result.totalDays + " days";
        healthScoreElement.innerHTML = "<strong>Road Health Score:</strong> " + result.healthScore + "/100";
        deteriorationRateElement.innerHTML = "<strong>Deterioration Rate:</strong> " + result.deteriorationRate + " points/month";
        
        // Color code based on maintenance urgency and update container class
        resultContainer.classList.remove("urgent", "warning", "good");
        
        if (result.totalDays < 30) {
            resultElement.style.color = colors.accent;
            resultContainer.classList.add("urgent");
        } else if (result.totalDays < 90) {
            resultElement.style.color = colors.warning;
            resultContainer.classList.add("warning");
        } else {
            resultElement.style.color = colors.success;
            resultContainer.classList.add("good");
        }
    }
    
    // Reset form to default values
    function resetForm() {
        // Reset location details
        document.getElementById('province').value = '';
        document.getElementById('district').value = '';
        document.getElementById('sector').value = '';
        document.getElementById('road-from').value = '';
        document.getElementById('road-to').value = '';
        document.getElementById('road-length').value = '0';
        document.getElementById('surface-material').value = 'gravel';
        
        // Reset road condition parameters
        document.getElementById('R').value = '1';
        document.getElementById('G').value = '0';
        document.getElementById('P').value = '0';
        document.getElementById('D').value = '1';
        document.getElementById('ADT').value = '0';
        document.getElementById('RF').value = '0';
        
        updateDisplay();
    }
    
    // Generate PDF Report
    function generatePDF() {
        const result = calculateMetrics();
        
        // Create a new PDF document
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Set font - Times New Roman
        doc.setFont('Times', 'normal');
        
        // Add header
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('PREDICTIVE MAINTENANCE REPORT', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Rwanda Feeder Roads - Maintenance Planning Tool', 105, 22, { align: 'center' });
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        // Add location details in top right corner
        const province = document.getElementById('province').value || 'Not specified';
        const district = document.getElementById('district').value || 'Not specified';
        const sector = document.getElementById('sector').value || 'Not specified';
        const roadFrom = document.getElementById('road-from').value || 'Not specified';
        const roadTo = document.getElementById('road-to').value || 'Not specified';
        const roadLength = document.getElementById('road-length').value || '0';
        const surfaceMaterial = document.getElementById('surface-material').value || 'Not specified';
        
        doc.setFontSize(10);
        doc.text(`Location: ${province}, ${district}`, 150, 40, { align: 'right' });
        doc.text(`Sector: ${sector}`, 150, 46, { align: 'right' });
        doc.text(`Road: ${roadFrom} to ${roadTo}`, 150, 52, { align: 'right' });
        doc.text(`Length: ${roadLength} km | Surface: ${surfaceMaterial}`, 150, 58, { align: 'right' });
        
        // Add date
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(`Generated on: ${dateStr}`, 15, 40);
        
        // Add formula section
        doc.setFontSize(16);
        doc.text('PREDICTIVE MAINTENANCE TIME FORMULA', 15, 75);
        doc.setFontSize(12);
        doc.text('T = (100 - (2×R) - (3×(G/100)) - (4×P) - (3×D)) / ((0.1×ADT) + (0.05×RF))', 15, 85);
        
        // Add input parameters
        doc.setFontSize(16);
        doc.text('ROAD CONDITION PARAMETERS', 15, 105);
        doc.setFontSize(12);
        
        const R = document.getElementById('R').value;
        const G = document.getElementById('G').value;
        const P = document.getElementById('P').value;
        const D = document.getElementById('D').value;
        const ADT = document.getElementById('ADT').value;
        const RF = document.getElementById('RF').value;
        
        doc.text(`Rutting Severity Index (R): ${R}`, 20, 115);
        doc.text(`Gravel Loss (G): ${G}%`, 20, 122);
        doc.text(`Pothole Density (P): ${P} per 100m`, 20, 129);
        doc.text(`Drainage Condition Index (D): ${D}`, 20, 136);
        doc.text(`Average Daily Traffic (ADT): ${ADT} vehicles/day`, 20, 143);
        doc.text(`Monthly Rainfall (RF): ${RF} mm/month`, 20, 150);
        
        // Add results section
        doc.setFontSize(16);
        doc.text('MAINTENANCE RECOMMENDATION', 15, 170);
        doc.setFontSize(24);
        
        // Color code based on urgency
        if (result.totalDays < 30) {
            doc.setTextColor(231, 76, 60); // Red
        } else if (result.totalDays < 90) {
            doc.setTextColor(243, 156, 18); // Orange
        } else {
            doc.setTextColor(39, 174, 96); // Green
        }
        
        let resultText;
        if (result.months === "Undefined") {
            resultText = "Enter parameters to calculate";
        } else if (result.months === 0 && result.days === 0) {
            resultText = "0 months";
        } else if (result.months === 0) {
            resultText = `${result.days} days`;
        } else if (result.days === 0) {
            resultText = `${result.months} months`;
        } else {
            resultText = `${result.months} months, ${result.days} days`;
        }
        
        doc.text(resultText, 105, 185, { align: 'center' });
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        // Add breakdown
        doc.text('Calculation Details:', 15, 200);
        doc.text(`Road Health Score: ${result.healthScore}/100`, 20, 207);
        doc.text(`Deterioration Rate: ${result.deteriorationRate} points/month`, 20, 214);
        doc.text(`Total Days: ${result.totalDays} days`, 20, 221);
        
        // Add interpretation
        doc.setFontSize(14);
        doc.text('INTERPRETATION', 15, 240);
        doc.setFontSize(10);
        
        let interpretation = '';
        if (result.totalDays < 30) {
            interpretation = 'URGENT: Road requires immediate maintenance intervention to prevent further deterioration and safety hazards.';
        } else if (result.totalDays < 90) {
            interpretation = 'PRIORITY: Schedule maintenance within the next quarter to maintain road serviceability and prevent accelerated deterioration.';
        } else {
            interpretation = 'ROUTINE: Road is in acceptable condition. Schedule maintenance as part of regular maintenance planning cycle.';
        }
        
        // Split long text into multiple lines
        const splitText = doc.splitTextToSize(interpretation, 180);
        doc.text(splitText, 15, 250);
        
        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Generated by Predictive Maintenance Time Estimator - Rwanda Polytechnic/Musanze College', 105, 290, { align: 'center' });
        
        // Save the PDF
        doc.save(`Road_Maintenance_Report_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`);
    }
    
    // Modal functions
    function openSourcesModal() {
        sourcesModal.style.display = 'flex';
    }
    
    function closeSourcesModal() {
        sourcesModal.style.display = 'none';
    }
    
    // Event listeners
    inputs.forEach(input => {
        input.addEventListener('input', updateDisplay);
    });
    
    calculateBtn.addEventListener('click', updateDisplay);
    resetBtn.addEventListener('click', resetForm);
    pdfBtn.addEventListener('click', generatePDF);
    sourcesBtn.addEventListener('click', openSourcesModal);
    closeSources.addEventListener('click', closeSourcesModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === sourcesModal) {
            closeSourcesModal();
        }
    });
    
    // Contact Modal elements
    const contactModal = document.getElementById('contact-modal');
    const contactLink = document.getElementById('contact-link'); // Assuming you'll add an ID to your contact link in HTML
    const closeContact = contactModal.querySelector('.close-button');

    // Function to open contact modal
    function openContactModal() {
        contactModal.classList.add('active');
    }

    // Function to close contact modal
    function closeContactModal() {
        contactModal.classList.remove('active');
    }

    // Event listeners for contact modal
    if (contactLink) {
        contactLink.addEventListener('click', function(event) {
            event.preventDefault();
            openContactModal();
        });
    }

    closeContact.addEventListener('click', closeContactModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === contactModal) {
            closeContactModal();
        }
    });

    // Initialize with default calculation
    updateDisplay();
});