function checkPhotosLimit() {
    const photosInput = document.getElementById('photos');
    const photoError = document.getElementById('photo-error');
    const imagePreview = document.getElementById('image-preview');
    const files = photosInput.files;

    imagePreview.innerHTML = '';
    photoError.style.display = 'none';

    if (files.length > 7) {
        photoError.style.display = 'block';
        photosInput.value = ''; 
        return;
    }

    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.maxWidth = '100px'; 
            imgElement.style.margin = '5px';
            imagePreview.appendChild(imgElement);
        };

        reader.readAsDataURL(file);
    });
}


$(document).ready(function() {
    $('#city').select2({
        placeholder: "Select a City",
        allowClear: true,
        tags: true  
    });
});

$(document).ready(function() {
    $('#state').select2({
        placeholder: "Select a State",
        allowClear: true,
        tags: true  
    });
});

$(document).ready(function() {
    $('#property_type').select2({
        placeholder: "Select Property type",
        allowClear: true,
        tags: true  
    });
});

$(document).ready(function() {
    $('#facing').select2({
        placeholder: "Select Facing",
        allowClear: true,
        tags: true  
    });
});



function togglePriceFields() {
    const rentRadio = document.getElementById('rent');
    const priceLabel = document.getElementById('priceLabel');
    const priceField = document.getElementById('price');
    const depositLabel = document.getElementById('depositLabel');
    const depositField = document.getElementById('deposit');

    if (rentRadio.checked) {
        depositLabel.style.display = 'block';
        depositField.style.display = 'block';
        priceLabel.textContent = 'Monthly Rent';
    } else {
        depositLabel.style.display = 'none';
        depositField.style.display = 'none';
        priceLabel.textContent = 'Price of the property';
    }
}
togglePriceFields();


// Function to toggle a description item in the textarea
function toggleDescription(checkbox, description) {
    const descriptionList = document.getElementById('finalDescription');
    let currentText = descriptionList.value.split('\n').filter(line => line.trim() !== '');

    if (checkbox.checked) {
        currentText.push(`• ${description}`);
    } else {
        currentText = currentText.filter(item => item !== `• ${description}`);
    }

    descriptionList.value = currentText.join('\n');
}

// Function to add a custom description directly into the textarea
function addCustomDescription() {
    const customInput = document.getElementById('customDescriptionInput');
    const description = customInput.value.trim();

    if (description) {
        const descriptionList = document.getElementById('finalDescription');
        let currentText = descriptionList.value.split('\n').filter(line => line.trim() !== '');

        currentText.push(`• ${description}`);
        descriptionList.value = currentText.join('\n');

        customInput.value = ''; 
    }
}

// Function to handle Enter key press in the textarea and insert a bullet point
function handleTextareaKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  
        const textarea = event.target;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const textAfterCursor = textarea.value.substring(cursorPosition);

        // Insert a bullet point and new line at the current cursor position
        textarea.value = `${textBeforeCursor}\n• ${textAfterCursor}`;
        
        // Move the cursor to the end of the newly inserted bullet point
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3;
    }
}


