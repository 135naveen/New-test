let previousResults = [];
let latestResult = null;
let latestPeriod = null;
let winCount = 0;
let lossCount = 0;
let storedHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

// ✅ Function to Fetch Game Issue
async function fetchCurrentGameIssue() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetGameIssue';
    const requestData = {
        typeId: 1,
        language: 0,
        random: "40079dcba93a48769c6ee9d4d4fae23f",
        signature: "D12108C4F57C549D82B23A91E0FA20AE",
        timestamp: Date.now()
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                latestPeriod = data.data.issueNumber;
                document.getElementById('period-number').textContent = latestPeriod;
                fetchPreviousResults();
            } else {
                console.error("❌ API Error:", data.message);
            }
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

// ✅ Function to Fetch Previous Results
async function fetchPreviousResults() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList';
    const requestData = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 0,
        random: "c2505d9138da4e3780b2c2b34f2fb789",
        signature: "7D637E060DA35C0C6E28DC6D23D71BED",
        timestamp: Date.now(),
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0 && data.data.list.length > 0) {
                previousResults = data.data.list;
                updateResults();
            } else {
                console.error("❌ API Error: No results found.");
            }
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

// ✅ Function to Update Results
function updateResults() {
    if (previousResults.length > 0) {
        latestResult = previousResults[0].number <= 4 ? 'SMALL' : 'BIG';
        const predictedElement = document.getElementById('predicted-result');
        
        predictedElement.textContent = latestResult;
        predictedElement.className = latestResult === 'SMALL' ? 'text-blue-500 font-bold' : 'text-red-500 font-bold';

        updateHistory();
    } else {
        console.warn("⚠ No results found for prediction.");
    }
}

// ✅ Function to Update History
function updateHistory() {
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '';

    let status = 'LOST';
    if (storedHistory.length > 0 && storedHistory[0].prediction === latestResult) {
        status = 'WON';
        winCount++;
    } else {
        lossCount++;
    }

    // Store New Entry
    storedHistory.unshift({
        period: latestPeriod ? latestPeriod.toString().slice(-4) : "N/A",
        prediction: latestResult,
        status: status
    });

    storedHistory.slice(0, 10).forEach(entry => {
        const box = document.createElement('div');
        box.className = "history-box text-center p-3 rounded " + (entry.status === 'WON' ? 'bg-green-50' : 'bg-red-50');
        box.innerHTML = `<p class="text-gray-600">Period: ${entry.period}</p>  
                         <p class="text-gray-600">Prediction: ${entry.prediction}</p>  
                         <p class="${entry.status === 'WON' ? 'text-green-500' : 'text-red-500'} font-bold">${entry.status}</p>`;
        historyContainer.appendChild(box);
    });

    localStorage.setItem("gameHistory", JSON.stringify(storedHistory.slice(0, 10)));

    // Update Win/Loss Count
    document.getElementById('won-count').textContent = winCount;
    document.getElementById('lost-count').textContent = lossCount;
    let winPercentage = winCount + lossCount === 0 ? 0 : ((winCount / (winCount + lossCount)) * 100).toFixed(1);
    document.getElementById('win-percentage').textContent = winPercentage + "%";
}

// ✅ Auto-Fetch Every 5 Seconds
setInterval(fetchCurrentGameIssue, 5000);
fetchCurrentGameIssue();
