window.insightsTab = (() => {

    function _getComparisonData(studyId, allStats) {
        if (!studyId || !allStats) return null;

        let cohortId, n;

        if (studyId.startsWith('bf_')) {
            cohortId = studyId.split('_')[1];
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            n = cohortStats.descriptive?.patientCount || 0;
        } else {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
            if (!studySet) return null;
            cohortId = studySet.applicableCohort || 'Overall';
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            n = cohortStats.descriptive?.patientCount || 0;
        }

        const performanceAS = allStats[cohortId]?.performanceAS;
        if (!performanceAS) return null;
        
        return { cohortId, n, performanceAS };
    }

    function _renderMismatchAnalysis(allStats, processedData) {
        const selectedStudyId = window.state.getInsightsMismatchStudyId();
        const resultsContainer = document.getElementById('mismatch-analysis-results');
        const interpretationContainer = document.getElementById('mismatch-analysis-interpretation');
        if (!resultsContainer || !interpretationContainer) return;
    
        const compData = _getComparisonData(selectedStudyId, allStats);
        if (!compData) {
            resultsContainer.innerHTML = '<p class="text-muted small p-3 text-center">Data for mismatch analysis is not available for the selected criteria set.</p>';
            interpretationContainer.innerHTML = '';
            return;
        }
    
        const { cohortId } = compData;
        const cohortData = window.dataProcessor.filterDataByCohort(processedData, cohortId);
        let studySet;
    
        if (selectedStudyId.startsWith('bf_')) {
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            const bfDef = allStats[cohortId]?.bruteforceDefinitions?.[bfMetric];
            if(bfDef) studySet = { criteria: bfDef.criteria, logic: bfDef.logic };
        } else {
            studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
        }
        
        if (!studySet) {
            resultsContainer.innerHTML = '<p class="text-danger small p-3 text-center">Could not find criteria definition for mismatch analysis.</p>';
            interpretationContainer.innerHTML = '';
            return;
        }
        
        const evaluatedData = studySet.logic === 'KOMBINIERT'
            ? window.studyT2CriteriaManager.evaluateDatasetWithStudyCriteria(cohortData, studySet)
            : window.t2CriteriaManager.evaluateDataset(cohortData, studySet.criteria, studySet.logic);
    
        const mismatch = window.mismatchAnalyzer.analyze(evaluatedData);
    
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab.mismatchAnalysis;
        const createCell = (label, count, bgColor, key, tooltip, sub_fp = 0, sub_fn = 0) => {
            const subcat_fp_text = texts.subcat_fp;
            const subcat_fn_text = texts.subcat_fn;

            let subHTML = '';
            if (sub_fp > 0 || sub_fn > 0) {
                const total = sub_fp + sub_fn;
                const fp_perc = total > 0 ? (sub_fp / total) * 100 : 0;
                const fn_perc = total > 0 ? (sub_fn / total) * 100 : 0;
                subHTML = `
                <div class="mismatch-sub-bars mt-2">
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-warning" role="progressbar" style="width: ${fp_perc}%;" aria-valuenow="${fp_perc}" aria-valuemin="0" aria-valuemax="100" data-tippy-content="${sub_fp} ${subcat_fp_text}"></div>
                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${fn_perc}%;" aria-valuenow="${fn_perc}" aria-valuemin="0" aria-valuemax="100" data-tippy-content="${sub_fn} ${subcat_fn_text}"></div>
                    </div>
                </div>`;
            }

            return `
            <div class="mismatch-cell d-flex flex-column justify-content-center align-items-center p-3 rounded ${bgColor}" data-action="show-mismatch-details" data-mismatch-key="${key}" data-tippy-content="${tooltip}" style="cursor: pointer;">
                <span class="mismatch-label small text-center">${label}</span>
                <span class="mismatch-count fw-bold display-6 my-1">${count}</span>
                ${subHTML}
            </div>`;
        }
    
        const html = `
            <div class="diagnostic-agreement-grid">
                <div class="grid-header-top text-center small fw-bold text-muted">T2 Criteria Prediction</div>
                <div class="grid-header-left text-center small fw-bold text-muted"><span>Avocado Sign Prediction</span></div>
                <div class="grid-header-item text-center small">Correct</div>
                <div class="grid-header-item text-center small">Incorrect</div>
                <div class="grid-header-item text-center small">Correct</div>
                ${createCell(texts.concordantCorrect, mismatch.concordantCorrect.length, 'bg-success-subtle', 'concordantCorrect', texts.tooltip_concordantCorrect)}
                ${createCell(texts.asSuperior, mismatch.asSuperior.length, 'bg-primary-subtle', 'asSuperior', texts.tooltip_asSuperior, mismatch.asSuperior_avoids_fp.length, mismatch.asSuperior_avoids_fn.length)}
                <div class="grid-header-item text-center small">Incorrect</div>
                ${createCell(texts.t2Superior, mismatch.t2Superior.length, 'bg-info-subtle', 't2Superior', texts.tooltip_t2Superior, mismatch.t2Superior_avoids_fp.length, mismatch.t2Superior_avoids_fn.length)}
                ${createCell(texts.concordantIncorrect, mismatch.concordantIncorrect.length, 'bg-danger-subtle', 'concordantIncorrect', texts.tooltip_concordantIncorrect)}
            </div>`;
        
        resultsContainer.innerHTML = html;
        window.state.setMismatchData(mismatch);
        
        const totalMismatch = mismatch.asSuperior.length + mismatch.t2Superior.length;
        let interpretationText;
        if (totalMismatch > 0) {
            interpretationText = `In <strong>${mismatch.asSuperior.length}</strong> of ${totalMismatch} discordant cases, the Avocado Sign provided the correct diagnosis where the T2 criteria failed. Conversely, the T2 criteria were superior in <strong>${mismatch.t2Superior.length}</strong> cases. The Avocado Sign's advantage stemmed from avoiding <strong>${mismatch.asSuperior_avoids_fp.length}</strong> false-positive and <strong>${mismatch.asSuperior_avoids_fn.length}</strong> false-negative T2 classifications.`;
        } else {
            interpretationText = `There were no discordant cases between the Avocado Sign and the selected T2 criteria in this cohort. Both methods agreed on the diagnosis for all patients.`;
        }
        interpretationContainer.innerHTML = `<p class="mb-0"><strong>Interpretation:</strong> ${interpretationText}</p>`;
    }

    function _renderDiagnosticPowerAnalysis(allStats) {
        const selectedCohort = window.state.getInsightsDiagnosticPowerCohort();
        const chartContainer = document.getElementById('diagnostic-power-chart-container');
        const interpretationContainer = document.getElementById('diagnostic-power-interpretation');

        if (!chartContainer || !interpretationContainer) return;
        
        const analysisData = window.diagnosticPowerAnalyzer.analyze(allStats, selectedCohort);
        
        if (analysisData.length === 0) {
            chartContainer.innerHTML = `<p class="text-muted small p-3 text-center">No data available for Diagnostic Power Analysis in the <strong>${getCohortDisplayName(selectedCohort)}</strong> cohort.</p>`;
            interpretationContainer.innerHTML = '';
            return;
        }

        window.chartRenderer.renderDORForestPlot(analysisData, chartContainer.id);
        
        const strongestMethod = analysisData[0];
        if(strongestMethod && strongestMethod.dor){
            const interpretationText = `In the <strong>${getCohortDisplayName(selectedCohort)}</strong> cohort, the <strong>${escapeHTML(strongestMethod.name)}</strong> method demonstrates the highest diagnostic power, with a Diagnostic Odds Ratio (DOR) of <strong>${formatNumber(strongestMethod.dor.value, 2)}</strong> (95% CI: ${formatNumber(strongestMethod.dor.ci.lower, 2)}–${formatNumber(strongestMethod.dor.ci.upper, 2)}). This indicates the strongest ability to discriminate between N-positive and N-negative patients among the evaluated methods.`;
            interpretationContainer.innerHTML = `<p class="mb-0"><strong>Interpretation:</strong> ${interpretationText}</p>`;
        } else {
            interpretationContainer.innerHTML = '';
        }
    }
    
    function _renderView(allStats, processedData){
        const insightsView = window.state.getInsightsView();
        const contentArea = document.getElementById('insights-content-area');
        if (!contentArea) return;
        let cardHTML = '';
        
        switch(insightsView) {
            case 'mismatch-analysis':
                const mismatchStudyId = window.state.getInsightsMismatchStudyId();
                cardHTML = window.uiComponents.createStatisticsCard('mismatch-analysis', window.APP_CONFIG.UI_TEXTS.insightsTab.mismatchAnalysis.cardTitle, window.uiComponents.createMismatchAnalysisCardHTML(mismatchStudyId), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-9 col-lg-10">${cardHTML}</div></div>`;
                _renderMismatchAnalysis(allStats, processedData);
                break;
            case 'diagnostic-power':
                const selectedCohort = window.state.getInsightsDiagnosticPowerCohort();
                cardHTML = window.uiComponents.createStatisticsCard('diagnostic-power', window.APP_CONFIG.UI_TEXTS.insightsTab.diagnosticPowerAnalysis.cardTitle, window.uiComponents.createDiagnosticPowerAnalysisCardHTML(selectedCohort), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-10 col-lg-12">${cardHTML}</div></div>`;
                _renderDiagnosticPowerAnalysis(allStats);
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
                        <input type="radio" class="btn-check" name="insightsView" id="view-mismatch-analysis" value="mismatch-analysis" ${insightsView === 'mismatch-analysis' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="view-mismatch-analysis"><i class="fas fa-not-equal me-2"></i>${texts.mismatchAnalysis.cardTitle}</label>
                        
                        <input type="radio" class="btn-check" name="insightsView" id="view-diagnostic-power" value="diagnostic-power" ${insightsView === 'diagnostic-power' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="view-diagnostic-power"><i class="fas fa-bolt me-2"></i>${texts.diagnosticPowerAnalysis.cardTitle}</label>
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
        renderMismatchAnalysis: _renderMismatchAnalysis,
        renderDiagnosticPowerAnalysis: _renderDiagnosticPowerAnalysis,
        renderView: _renderView
    });

})();