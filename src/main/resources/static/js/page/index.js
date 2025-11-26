document.addEventListener('DOMContentLoaded', () => {
    const sessionFilter = window.SESSION_FILTER || {};
    const isAdmin = !!sessionFilter.isAdmin;

    // Parking filters
    const parkingSido = document.getElementById('parkingSido');
    const parkingSigungu = document.getElementById('parkingSigungu');
    const parkingSearchBtn = document.getElementById('parkingSearchBtn');

    // Parking cards
    const draftCard = document.getElementById('parking-draft');
    const inSurveyCard = document.getElementById('parking-in-survey');
    const pendingCard = document.getElementById('parking-pending');
    const approvedCard = document.getElementById('parking-approved');
    const rejectedCard = document.getElementById('parking-rejected');
    const parkingTotal = document.getElementById('parking-total');

    // Usage filters
    const usageSido = document.getElementById('usageSido');
    const usageSigungu = document.getElementById('usageSigungu');
    const usageSearchBtn = document.getElementById('usageSearchBtn');

    // Usage cards
    const illegalCard = document.getElementById('usage-illegal');
    const legalCard = document.getElementById('usage-legal');
    const usageTotal = document.getElementById('usage-total');

    // --- Functions ---

    /**
     * Fetches data from a URL and returns it as JSON.
     * @param {string} url - The URL to fetch.
     * @returns {Promise<any>} - The JSON response.
     */
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            return null;
        }
    }

    /**
     * Populates a select element with options.
     * @param {HTMLSelectElement} selectElement - The select element to populate.
     * @param {Array<object>} data - The data for the options.
     * @param {string} valueField - The field for the option value.
     * @param {string} textField - The field for the option text.
     */
    function populateSelect(selectElement, data, valueField, textField) {
        selectElement.innerHTML = '<option value="">전체</option>'; // Reset and add default option
        if (data) {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
        }
    }

    /**
     * Loads the Sido (province) dropdown.
     */
    async function loadSido(select) {
        const sidoData = await fetchData('/cmm/codes/sido');
        if (sidoData && sidoData.success) {
            populateSelect(select, sidoData.data, 'codeCd', 'codeNm');
            if (sessionFilter.sidoCd) {
                select.value = sessionFilter.sidoCd;
                select.dispatchEvent(new Event('change'));
            }
            if (!isAdmin) {
                select.disabled = true;
            }
        }
    }

    /**
     * Loads the Sigungu (city/district) dropdown based on the selected Sido.
     */
    async function loadSigungu(sidoInput, sigunguInput, callback) {
        const sidoCd = sidoInput.value;
        sigunguInput.innerHTML = '<option value="">전체</option>'; // Clear sigungu select
        sigunguInput.disabled = true;
        if (!sidoCd) {
            if (callback) callback();
            return;
        }

        const sigunguData = await fetchData(`/cmm/codes/sigungu?sidoCd=${sidoCd}`);
        if (sigunguData && sigunguData.success) {
            populateSelect(sigunguInput, sigunguData.data, 'codeCd', 'codeNm');
            sigunguInput.disabled = false;
            if (sessionFilter.sigunguCd) {
                sigunguInput.value = sessionFilter.sigunguCd;
            }
            if (!isAdmin) {
                sigunguInput.disabled = true;
            }
        }
        if (callback) callback();
    }

    /**
     * Fetches parking status data and updates the UI.
     * @param {string} url - The API URL.
     */
    async function updateParkingStatus(url) {
        const data = await fetchData(url);
        if (data) {
            const status = data.status || {};
            draftCard.textContent = status["00"] ?? 0;
            inSurveyCard.textContent = status["10"] ?? 0;
            pendingCard.textContent = status["20"] ?? 0;
            approvedCard.textContent = status["30"] ?? 0;
            rejectedCard.textContent = status["99"] ?? 0;
            if (parkingTotal) {
                parkingTotal.textContent = `총 ${data.total ?? 0}건`;
            }
        } else {
            [draftCard, inSurveyCard, pendingCard, approvedCard, rejectedCard].forEach(card => card.textContent = 'N/A');
            if (parkingTotal) {
                parkingTotal.textContent = '총 0건';
            }
        }
    }

    /**
     * Fetches usage status data and updates the UI.
     * @param {string} url - The API URL.
     */
    async function updateUsageStatus(url) {
        const data = await fetchData(url);
        if (data) {
            illegalCard.textContent = data.illegal ?? 0;
            legalCard.textContent = data.legal ?? 0;
            if (usageTotal) {
                usageTotal.textContent = `총 ${data.total ?? 0}건`;
            }
        } else {
            [illegalCard, legalCard].forEach(card => card.textContent = 'N/A');
            if (usageTotal) {
                usageTotal.textContent = '총 0건';
            }
        }
    }


    // --- Event Listeners ---
    parkingSido.addEventListener('change', () => loadSigungu(parkingSido, parkingSigungu));
    parkingSearchBtn.addEventListener('click', () => {
        const params = [];
        const sendSido = isAdmin ? parkingSido.value : (sessionFilter.sidoCd || '');
        const sendSigungu = isAdmin ? parkingSigungu.value : (sessionFilter.sigunguCd || '');
        if (sendSido) params.push(`sidoCd=${sendSido}`);
        if (sendSigungu) params.push(`sigunguCd=${sendSigungu}`);
        let url = '/api/dashboard/parking-status';
        if (params.length) url += `?${params.join('&')}`;
        updateParkingStatus(url);
    });

    usageSido.addEventListener('change', () => loadSigungu(usageSido, usageSigungu));
    usageSearchBtn.addEventListener('click', () => {
        const params = [];
        const sendSido = isAdmin ? usageSido.value : (sessionFilter.sidoCd || '');
        const sendSigungu = isAdmin ? usageSigungu.value : (sessionFilter.sigunguCd || '');
        if (sendSido) params.push(`sidoCd=${sendSido}`);
        if (sendSigungu) params.push(`sigunguCd=${sendSigungu}`);
        let url = '/api/dashboard/usage-status';
        if (params.length) url += `?${params.join('&')}`;
        updateUsageStatus(url);
    });


    // --- Initial Load ---
    async function initialize() {
        await loadSido(parkingSido);
        await loadSido(usageSido);

        const parkingParams = [];
        if (sessionFilter.sidoCd) parkingParams.push(`sidoCd=${sessionFilter.sidoCd}`);
        if (sessionFilter.sigunguCd) parkingParams.push(`sigunguCd=${sessionFilter.sigunguCd}`);
        let parkingUrl = '/api/dashboard/parking-status';
        if (parkingParams.length) parkingUrl += `?${parkingParams.join('&')}`;

        const usageParams = [];
        if (sessionFilter.sidoCd) usageParams.push(`sidoCd=${sessionFilter.sidoCd}`);
        if (sessionFilter.sigunguCd) usageParams.push(`sigunguCd=${sessionFilter.sigunguCd}`);
        let usageUrl = '/api/dashboard/usage-status';
        if (usageParams.length) usageUrl += `?${usageParams.join('&')}`;

        await updateParkingStatus(parkingUrl);
        await updateUsageStatus(usageUrl);
    }

    initialize();
});
