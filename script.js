document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addCriterion').addEventListener('click', addCriterion);
    document.getElementById('generateRubric').addEventListener('click', generateRubric);
    document.getElementById('printRubric').addEventListener('click', printRubric);
document.getElementById('updateRubric').addEventListener('click', updateRubric);

});

function addCriterion() {
    const criteriaContainer = document.getElementById('criteria-container');
    const newCriterion = document.createElement('div');
    newCriterion.innerHTML = `
        <input type="text" placeholder="Criterion Name">
        <input type="number" placeholder="Weight" min="0" max="100">
    `;
    criteriaContainer.appendChild(newCriterion);
}
document.addEventListener('DOMContentLoaded', function() {
    // ... existing event listener bindings
    document.getElementById('exportData').addEventListener('click', exportData);
});

// ... existing functions

function exportData() {
    const students = document.getElementById('student-list').value.split('\n');
    const criteriaElements = document.getElementById('criteria-container').children;
    let csvContent = "data:text/csv;charset=utf-8,";

    // Header Row
    let headerRow = 'Student Name,';
    Array.from(criteriaElements).forEach((criterion, index) => {
        headerRow += criterion.querySelector('input[type="text"]').value + (index < criteriaElements.length - 1 ? ',' : ',Total Score\n');
    });
    csvContent += headerRow;

    // Data Rows
    const rubricTable = document.getElementById('rubric-table-container').querySelector('table');
    if (rubricTable) {
        Array.from(rubricTable.rows).forEach((row, rowIndex) => {
            if (rowIndex > 0) { // Skip header row
                let rowData = '';
                Array.from(row.cells).forEach((cell, cellIndex) => {
                    if (cellIndex === 0) { // Student name
                        rowData += cell.textContent + ',';
                    } else if (cell.querySelector('.score-slider')) { // Slider value
                        rowData += cell.querySelector('.score-slider').value + ',';
                    } else { // Total score
                        rowData += cell.textContent + '\n';
                    }
                });
                csvContent += rowData;
            }
        });
    }

    // Encoding and Downloading
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rubric_data.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "rubric_data.csv"
}


function generateRubric() {
    const students = document.getElementById('student-list').value.split('\n');
    const criteriaElements = document.getElementById('criteria-container').children;
    const rubricTableContainer = document.getElementById('rubric-table-container');
    
    let table = '<table border="1"><tr><th>Student Name</th>';

    for (let criterion of criteriaElements) {
        let criterionName = criterion.querySelector('input[type="text"]').value;
        table += `<th>${criterionName}</th>`;
    }

    // Add a header for the total score column
    table += '<th>Total Score</th></tr>';

    for (let student of students) {
        if (student.trim() === '') continue;
        table += `<tr><td>${student}</td>`;
        for (let i = 0; i < criteriaElements.length; i++) {
            table += '<td><input type="range" min="0" max="100" value="0" class="score-slider"></td>';
        }
        // Add a cell for the total score
        table += '<td class="total-score">0</td></tr>';
    }

    table += '</table>';

    rubricTableContainer.innerHTML = table;
    attachSliderEventListeners();
}

function attachSliderEventListeners() {
    const sliders = document.querySelectorAll('.score-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            updateTotalScore(this);
        });
    });
}

function updateTotalScore(slider) {
    const studentRow = slider.closest('tr');
    const sliders = studentRow.querySelectorAll('.score-slider');
    const criteriaElements = document.getElementById('criteria-container').children;
    
    let totalScore = 0;
    let totalWeight = 0;

    sliders.forEach((slider, index) => {
        const weight = parseFloat(criteriaElements[index].querySelector('input[type="number"]').value) || 0;
        totalScore += (slider.value * weight) / 100;
        totalWeight += weight;
    });

    if (totalWeight > 0) {
        totalScore = (totalScore / totalWeight) * 100;
    }

    const scoreCell = studentRow.querySelector('.total-score');
    scoreCell.textContent = totalScore.toFixed(2); // Rounds the score to 2 decimal places
}


function printRubric() {
    window.print();
}

document.addEventListener('DOMContentLoaded', function() {
    // ... existing event listeners
    document.getElementById('saveJson').addEventListener('click', saveAsJson);
});

// ... existing functions

function saveAsJson() {
    let rubricData = {
        rubricName: document.getElementById('rubric-title').value,
        criteria: [],
        students: []
    };

    // Save criteria and weights
   document.querySelectorAll('#criteria-container div').forEach(div => {
        let criterionName = div.querySelector('input[type="text"]').value;
        let criterionWeight = div.querySelector('input[type="number"]').value;
        rubricData.criteria.push({ name: criterionName, weight: criterionWeight });
    });

    // Save students, their scores, and total scores
 document.querySelectorAll('#rubric-table-container tr').forEach((tr, index) => {
        if (index === 0) return; // Skip the header row

        let studentData = {
            name: tr.cells[0].innerText,
            scores: [],
            totalScore: tr.cells[tr.cells.length - 1].innerText
        };

        tr.querySelectorAll('.score-slider').forEach(slider => {
            studentData.scores.push({
                value: slider.value, // Save the slider value
                tooltip: slider.parentNode.querySelector('.slider-tooltip').textContent // Save the tooltip text
            });
        });

        rubricData.students.push(studentData);
    });

    downloadObjectAsJson(rubricData, rubricData.rubricName || 'RubricData');
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
document.addEventListener('DOMContentLoaded', function() {
    // ... existing event listeners
    document.getElementById('loadJsonButton').addEventListener('click', function() {
        document.getElementById('loadJson').click(); // Trigger the hidden file input
    });
    document.getElementById('loadJson').addEventListener('change', loadFromJson);
});

// ... existing functions

function loadFromJson(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        applyJsonToRubric(data);
    };
    reader.readAsText(file);
}

function applyJsonToRubric(data) {
    // Set Rubric Name
    document.getElementById('rubric-title').value = data.rubricName;

    // Clear existing criteria
    document.getElementById('criteria-container').innerHTML = '';

    // Add criteria from JSON
    data.criteria.forEach(criterion => {
        let div = document.createElement('div');
        div.innerHTML = `
            <input type="text" value="${criterion.name}" placeholder="Criterion Name">
            <input type="number" value="${criterion.weight}" placeholder="Weight" min="0" max="100">
        `;
        document.getElementById('criteria-container').appendChild(div);
    });

    // Set student names
    document.getElementById('student-list').value = data.students.map(student => student.name).join('\n');

    // Generate the rubric to create fields
    generateRubric();

    // Apply scores from JSON
    setTimeout(() => {
        data.students.forEach((student, studentIndex) => {
            let studentRow = document.querySelector(`#rubric-table-container table tr:nth-child(${studentIndex + 2})`);
            if (studentRow) {
                student.scores.forEach((scoreData, scoreIndex) => {
                    let slider = studentRow.querySelectorAll('.score-slider')[scoreIndex];
                    if (slider) {
                        slider.value = scoreData.value; // Set the slider value
                        updateTotalScore(slider); // Update the total score based on the new slider value
                        let tooltip = slider.parentNode.querySelector('.slider-tooltip');
                        if (tooltip) {
                            tooltip.textContent = scoreData.tooltip; // Set the tooltip text
                        }
                    }
                });
            }
        });
    }, 0);
}

// ... existing event listeners at the end of your script

document.getElementById('addStudent').addEventListener('click', addStudent);
document.getElementById('removeCriterion').addEventListener('click', removeCriterion);

// ... existing functions

function addStudent() {
    const studentName = prompt("Enter the new student's name:");
    if (studentName && studentName.trim() !== '') {
        const rubricTable = document.getElementById('rubric-table-container').querySelector('table');
        if (rubricTable) {
            let newRow = rubricTable.insertRow(-1);
            let nameCell = newRow.insertCell(0);
            nameCell.textContent = studentName;

            for (let i = 0; i < rubricTable.rows[0].cells.length - 2; i++) {
                let sliderCell = newRow.insertCell(-1);
                sliderCell.innerHTML = '<input type="range" min="0" max="100" value="0" class="score-slider">';
                attachSliderEventToElement(sliderCell.querySelector('.score-slider'));
            }

            // Add a cell for the total score
            let totalScoreCell = newRow.insertCell(-1);
            totalScoreCell.className = 'total-score';
            totalScoreCell.textContent = '0';
        }
    }
}

function removeCriterion() {
    const criteriaContainer = document.getElementById('criteria-container');
    if (criteriaContainer.children.length > 0) {
        criteriaContainer.removeChild(criteriaContainer.lastChild);

        const rubricTable = document.getElementById('rubric-table-container').querySelector('table');
        if (rubricTable) {
            for (let i = 0; i < rubricTable.rows.length; i++) {
                rubricTable.rows[i].deleteCell(-2); // Remove second-to-last cell (just before total score)
            }
        }
    }
}

function attachSliderEventToElement(sliderElement) {
    sliderElement.addEventListener('input', function() {
        updateTotalScore(this);
    });
}
function attachSliderEventListeners() {
    const sliders = document.querySelectorAll('.score-slider');
    sliders.forEach(slider => {
        // Create and append the tooltip for each slider
        const tooltip = document.createElement('span');
        tooltip.className = 'slider-tooltip';
        tooltip.textContent = slider.value;
        slider.parentNode.appendChild(tooltip);

        slider.addEventListener('input', function() {
            updateTotalScore(this);
            updateSliderTooltip(this);
        });
    });
}

function attachSliderEventToElement(sliderElement) {
    const tooltip = document.createElement('span');
    tooltip.className = 'slider-tooltip';
    tooltip.textContent = sliderElement.value;
    sliderElement.parentNode.appendChild(tooltip);

    sliderElement.addEventListener('input', function() {
        updateTotalScore(this);
        updateSliderTooltip(this);
    });
}

function updateSliderTooltip(slider) {
    const tooltip = slider.parentNode.querySelector('.slider-tooltip');
    tooltip.textContent = slider.value;
}

// Rest of your existing code...
function updateRubric() {
    // Store existing data
    const oldData = extractCurrentRubricData();

    // Generate the rubric again with new criteria and students
    generateRubric();

    // Reapply the existing data
    reapplyRubricData(oldData);
}

function extractCurrentRubricData() {
    const data = { students: [] };

    document.querySelectorAll('#rubric-table-container tr').forEach((tr, index) => {
        if (index === 0) return; // Skip the header row

        let studentData = {
            name: tr.cells[0].innerText,
            scores: Array.from(tr.querySelectorAll('.score-slider')).map(slider => slider.value)
        };

        data.students.push(studentData);
    });

    return data;
}

function reapplyRubricData(oldData) {
    oldData.students.forEach(studentData => {
        const studentRow = Array.from(document.querySelectorAll('#rubric-table-container tr')).find(tr => tr.cells[0].innerText === studentData.name);
        if (studentRow) {
            studentData.scores.forEach((score, index) => {
                const slider = studentRow.querySelectorAll('.score-slider')[index];
                if (slider) {
                    slider.value = score;
                    updateTotalScore(slider);
                }
            });
        }
    });
}

function autosaveRubric() {
    const rubricData = extractCurrentRubricData();
    localStorage.setItem('rubricData', JSON.stringify(rubricData));
}

setInterval(autosaveRubric, 10000); // Autosave every 10 seconds

function attachChangeEventListeners() {
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('change', autosaveRubric);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    attachChangeEventListeners();
    // ... existing code
});

document.addEventListener('DOMContentLoaded', function() {
    const savedRubricData = localStorage.getItem('rubricData');
    if (savedRubricData) {
        const data = JSON.parse(savedRubricData);
        applyJsonToRubric(data);
    }
    // ... existing code
});
