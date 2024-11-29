let saveFiles = JSON.parse(localStorage.getItem('saveFiles')) || {};

// Helper function to update the save file dropdown
function updateSaveFileSelector() {
	const saveFileSelector = document.getElementById('save-file');
	saveFileSelector.innerHTML = '<option value="">-- Select Save File --</option>';

	Object.keys(saveFiles).forEach(saveName => {
		const option = document.createElement('option');
		option.value = saveName;
		option.textContent = saveName;
		saveFileSelector.appendChild(option);
	});

	// Automatically load cars for the first selected save
	const selectedSave = saveFileSelector.value;
	if (selectedSave) {
		loadCarList(selectedSave);
	}
}

// Create a new save file
function createSaveFile() {
	const saveFileName = prompt("Enter a name for the new save file:");
	if (saveFileName && !saveFiles[saveFileName]) {
		saveFiles[saveFileName] = [];
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		updateSaveFileSelector();
	} else {
		alert("Invalid or duplicate save file name!");
	}
}

// Delete selected save file
function deleteSaveFile() {
	const selectedSave = document.getElementById('save-file').value;
	if (selectedSave && confirm(`Are you sure you want to delete the save file: ${selectedSave}?`)) {
		delete saveFiles[selectedSave];
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		updateSaveFileSelector();
	}
}

// Save all data to a JSON file
function saveDataToFile() {
	const data = JSON.stringify(saveFiles, null, 2);  // Pretty print JSON
	const blob = new Blob([data], { type: 'application/json' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'saveData.json';  // Name of the file
	link.click();
}

// Load data from a JSON file
function loadDataFromFile(event) {
	const file = event.target.files[0];
	if (file && file.name.endsWith('.json')) {
		const reader = new FileReader();
		reader.onload = function(e) {
			try {
				const loadedData = JSON.parse(e.target.result);
				saveFiles = loadedData;
				localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
				updateSaveFileSelector();
				alert("Data loaded successfully!");
			} catch (err) {
				alert("Error loading data. Make sure it's a valid JSON file.");
			}
		};
		reader.readAsText(file);  // Read file as text
	} else {
		alert("Please select a valid JSON file.");
	}
}

// Create a new car for the selected save file
function createCar() {
	const selectedSave = document.getElementById('save-file').value;
	if (!selectedSave) {
		alert("Please select or create a save file first.");
		return;
	}

	const carName = prompt("Enter the car name (e.g., 'ETK I-Series 2400i'):");

	// Trim spaces around the car name but allow inner spaces
	const trimmedCarName = carName ? carName.trim() : '';

	if (!trimmedCarName) {
		alert("Car name cannot be empty!");
		return;
	}

	// Create a file input for image upload
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'image/*';
	fileInput.onchange = function(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				const imageUrl = e.target.result; // base64 image data
				if (trimmedCarName) {
					const car = {
						name: trimmedCarName, // Store the car name with spaces as is
						photo: imageUrl, // Store base64 image
						details: []
					};

					saveFiles[selectedSave].push(car);
					localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
					loadCarList(selectedSave);
				}
			};
			reader.readAsDataURL(file); // Read file as base64
		}
	};

	fileInput.click(); // Trigger the file input dialog
}

// Change the image of an existing car
function changeCarImage(saveName, carIndex) {
	const car = saveFiles[saveName][carIndex];

	// Create a file input for image upload
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'image/*';
	fileInput.onchange = function(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				const imageUrl = e.target.result; // base64 image data
				car.photo = imageUrl; // Update the car's image
				localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
				loadCarList(saveName);  // Refresh car list to show updated image
			};
			reader.readAsDataURL(file); // Read file as base64
		}
	};

	fileInput.click(); // Trigger the file input dialog
}

// Add a new detail to a car
function addCarDetail(saveName, carIndex) {
	const car = saveFiles[saveName][carIndex];
	const newDetail = prompt("Enter car modification/detail:");

	if (newDetail) {
		car.details.push(newDetail.trim()); // Trim whitespace from the new detail
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		loadCarList(saveName);  // Refresh car list to show new detail
	}
}

// Edit a car's detail
function editCarDetail(saveName, carIndex, detailIndex) {
	const car = saveFiles[saveName][carIndex];
	const currentDetail = car.details[detailIndex];
	const newDetail = prompt("Edit detail:", currentDetail);

	if (newDetail) {
		car.details[detailIndex] = newDetail.trim(); // Trim whitespace from detail
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		loadCarList(saveName);  // Refresh car list to show updated detail
	}
}

// Delete a car's detail
function deleteCarDetail(saveName, carIndex, detailIndex) {
	const car = saveFiles[saveName][carIndex];
	if (confirm(`Are you sure you want to delete the detail: "${car.details[detailIndex]}"?`)) {
		car.details.splice(detailIndex, 1);
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		loadCarList(saveName);  // Refresh car list to show updated details
	}
}

// Delete a car from the selected save file
function deleteCar(saveName, carIndex) {
	if (confirm("Are you sure you want to delete this car?")) {
		saveFiles[saveName].splice(carIndex, 1);
		localStorage.setItem('saveFiles', JSON.stringify(saveFiles));
		loadCarList(saveName);
	}
}

// Load the list of cars for the selected save file
function loadCarList(saveName) {
	const carListContainer = document.getElementById('car-list');
	carListContainer.innerHTML = '';

	saveFiles[saveName].forEach((car, carIndex) => {
		const carEntry = document.createElement('div');
		carEntry.classList.add('car-entry');

		const carImage = car.photo ? `<img src="${car.photo}" alt="${car.name}">` : '';
		const carDetails = car.details.length > 0
			? `<div class="car-details"><ul>${car.details.map((detail, detailIndex) => `
				<li>${detail}
					<button onclick="editCarDetail('${saveName}', ${carIndex}, ${detailIndex})" class="detail-btn">Edit</button>
					<button onclick="deleteCarDetail('${saveName}', ${carIndex}, ${detailIndex})" class="detail-btn">Delete</button>
				</li>
			`).join('')}</ul></div>`
			: `<p>No details added.</p>`;

		carEntry.innerHTML = `
			<h3>${car.name}</h3>  <!-- Display car name, which can have spaces -->
			${carImage}
			${carDetails}
			<button onclick="addCarDetail('${saveName}', ${carIndex})" class="add-detail-btn">+ Add Detail</button>
			<button onclick="deleteCar('${saveName}', ${carIndex})" class="car-btn">Delete Car</button>
			<button onclick="changeCarImage('${saveName}', ${carIndex})" class="car-btn">Change Image</button>
		`;

		carListContainer.appendChild(carEntry);
	});
}

// On page load, initialize everything
document.getElementById('save-file').addEventListener('change', (e) => {
	const selectedSave = e.target.value;
	if (selectedSave) {
		loadCarList(selectedSave);
	} else {
		document.getElementById('car-list').innerHTML = '';
	}
});

// File import
document.getElementById('import-file').addEventListener('change', loadDataFromFile);

// Update the save file selector on initial load
updateSaveFileSelector();
