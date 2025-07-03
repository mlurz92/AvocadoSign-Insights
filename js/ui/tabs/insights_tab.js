window.insightsTab = (() => {

    function _getComparisonData(studyId, allStats) {
        if (!studyId || !allStats) return null;

        let cohortId, performanceT2, comparisonASvsT2, n;

        if (studyId.startsWith('bf_')) {
            cohortId = studyId.split('_')[1];
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            performanceT2 = cohortStats.performanceT2Bruteforce?.[bfMetric];
            comparisonASvsT2 = cohortStats.comparisonASvsT2Bruteforce?.[bfMetric];
            n = cohortStats.descriptive?.patientCount || 0;
        } else {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
            if (!studySet) return null;
            cohortId = studySet.applicableCohort || 'Overall';
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            performanceT2 = cohortStats.performanceT2Literature?.[studyId];
            comparisonASvsT2 = cohortStats.comparisonASvsT2Literature?.[studyId];
            n = cohortStats.descriptive?.patientCount || 0;
        }

        const performanceAS = allStats[cohortId]?.performanceAS;
        if (!performanceAS || !performanceT2 || !comparisonASvsT2) return null;
        
        return { cohortId, n, performanceAS, performanceT2, comparisonASvsT2 };
    }

    function _renderPowerAnalysis(allStats) {
        const selectedStudyId = window.state.getInsightsPowerStudyId();
        const compData = _getComparisonData(selectedStudyId, allStats);
        const inputsContainer = document.getElementById('power-analysis-inputs');
        const resultsContainer = document.getElementById('power-analysis-results');
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab.powerAnalysis;

        if (!inputsContainer || !resultsContainer) return;

        const mode = document.querySelector('input[name="power-analysis-mode"]:checked')?.value || 'posthoc';
        let inputsHTML = '';
        let resultsHTML = '<p class="text-muted small">Awaiting calculation...</p>';
        
        if (!compData || !compData.comparisonASvsT2?.delong) {
            inputsContainer.innerHTML = '<p class="text-warning small">Comparison data for power analysis is not available for the selected criteria set.</p>';
            resultsContainer.innerHTML = '';
            return;
        }
        
        const { delong } = compData.comparisonASvsT2;
        const observedEffectSize = Math.abs(delong.diffAUC);
        const alpha = parseFloat(document.getElementById('power-alpha')?.value) || 0.05;

        if (mode === 'posthoc') {
            inputsHTML = `
                <div class="mb-2">
                    <label for="power-alpha" class="form-label small">${texts.alphaLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-alpha" value="${alpha}" step="0.01" min="0.001" max="0.2">
                </div>
                <div class="mb-2">
                    <label for="power-effect-size-info" class="form-label small">Observed AUC Difference (Effect Size):</label>
                    <input type="text" class="form-control form-control-sm" id="power-effect-size-info" value="${formatNumber(observedEffectSize, 3)}" readonly>
                </div>`;
            
            const power = window.statisticsService.calculatePostHocPower(delong, alpha);
            resultsHTML = `<div class="text-center">
                <p class="mb-1 small text-muted">${texts.postHocResult}</p>
                <h3 class="fw-bold text-primary mb-1">${isNaN(power) ? 'N/A' : formatPercent(power, 1)}</h3>
                <p class="small text-muted mb-0">The probability of detecting the observed effect, given the sample size (N=${compData.n}).</p>
            </div>`;
        } else {
            const targetPower = parseFloat(document.getElementById('power-target')?.value) || 0.8;
            const effectSize = parseFloat(document.getElementById('power-effect-size')?.value) || observedEffectSize;

            inputsHTML = `
                <div class="mb-2">
                    <label for="power-alpha" class="form-label small">${texts.alphaLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-alpha" value="${alpha}" step="0.01" min="0.001" max="0.2">
                </div>
                <div class="mb-2">
                    <label for="power-target" class="form-label small">${texts.powerLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-target" value="${targetPower}" step="0.05" min="0.5" max="0.99">
                </div>
                <div class="mb-2">
                    <label for="power-effect-size" class="form-label small">${texts.effectSizeLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-effect-size" value="${formatNumber(effectSize, 3, '', true)}" step="0.01" min="0.01" max="0.5">
                </div>`;
            
            const delongForSampleSize = {...delong, diffAUC: effectSize, n: compData.n};
            const requiredN = window.statisticsService.calculateRequiredSampleSize(delongForSampleSize, targetPower, alpha);
            resultsHTML = `<div class="text-center">
                <p class="mb-1 small text-muted">${texts.sampleSizeResult}</p>
                <h3 class="fw-bold text-primary mb-1">${isNaN(requiredN) ? 'N/A' : formatNumber(requiredN, 0)}</h3>
                <p class="small text-muted mb-0">Total patients needed to achieve ${formatPercent(targetPower,0)} power for an AUC difference of ${formatNumber(effectSize,3)}.</p>
            </div>`;
        }
        
        window.uiManager.updateElementHTML(inputsContainer.id, inputsHTML);
        window.uiManager.updateElementHTML(resultsContainer.id, resultsHTML);
    }
    
    function _renderView(allStats, processedData){
        const insightsView = window.state.getInsightsView();
        const contentArea = document.getElementById('insights-content-area');
        if (!contentArea) return;
        let cardHTML = '';
        
        switch(insightsView) {
            case 'power-analysis':
                const powerStudyId = window.state.getInsightsPowerStudyId();
                cardHTML = window.uiComponents.createStatisticsCard('power-analysis', window.APP_CONFIG.UI_TEXTS.insightsTab.powerAnalysis.cardTitle, window.uiComponents.createPowerAnalysisCardHTML(powerStudyId), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-10">${cardHTML}</div></div>`;
                _renderPowerAnalysis(allStats);
                break;
        }
    }

    function render(allStats, processedData) {
        const insightsView = window.state.getInsightsView();
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab;

        const html = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Insights View Selection">
                        <input type="radio" class="btn-check" name="insightsView" id="view-power-analysis" value="power-analysis" ${insightsView === 'power-analysis' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary active" for="view-power-analysis"><i class="fas fa-battery-half me-2"></i>${texts.powerAnalysis.cardTitle}</label>
                    </div>
                </div>
            </div>
            <div id="insights-content-area"></div>
        `;

        setTimeout(() => _renderView(allStats, processedData), 10);

        return html;
    }

    return Object.freeze({
        render,
        renderPowerAnalysis: _renderPowerAnalysis,
        renderView: _renderView
    });

})();