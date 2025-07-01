window.eventManager = (() => {
    let appContainer;
    let debouncedResize;
    let debounceTimer;

    function _debounce(func, delay) {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    function _handleTabClick(target) {
        const tabId = target.dataset.bsTarget.substring(1);
        if (tabId !== window.state.getActiveTabId()) {
            window.state.setActiveTabId(tabId);
            window.ui.renderApp();
        }
    }

    function _handleCohortChange(target) {
        const newCohort = target.value;
        if (newCohort !== window.state.getCurrentCohort()) {
            window.state.setCurrentCohort(newCohort);
            window.ui.renderApp();
        }
    }

    function _handleSortClick(target) {
        const headerCell = target.closest('th');
        if (!headerCell) return;
        
        const table = headerCell.closest('table');
        if (!table) return;

        const tableType = table.id.includes('data-table') ? 'data' : 'analysis';
        const key = headerCell.dataset.sortKey;
        const subKey = headerCell.dataset.sortSubKey || null;

        if (key) {
            window.state.updateSort(tableType, key, subKey);
            window.ui.renderApp();
        }
    }

    function _handleExpandRowClick(target) {
        const row = target.closest('tr');
        if (row && row.dataset.patientId) {
            const detailRowId = `details-for-${row.dataset.patientId}`;
            const detailRow = document.getElementById(detailRowId);
            if (detailRow) {
                const isExpanded = row.classList.toggle('expanded');
                detailRow.classList.toggle('d-none', !isExpanded);
                target.classList.toggle('expanded', isExpanded);
            }
        }
    }

    function _handleExpandAllClick(target) {
        const table = target.closest('.card').querySelector('table');
        if (!table) return;

        const isExpanding = !target.classList.contains('expanded');
        target.classList.toggle('expanded', isExpanding);
        target.innerHTML = isExpanding ? '<i class="fas fa-minus-square"></i>' : '<i class="fas fa-plus-square"></i>';
        
        const detailRows = table.querySelectorAll('tr.detail-row');
        const parentRows = table.querySelectorAll('tr[data-patient-id]');
        const expandButtons = table.querySelectorAll('.expand-button');

        detailRows.forEach(row => row.classList.toggle('d-none', !isExpanding));
        parentRows.forEach(row => row.classList.toggle('expanded', isExpanding));
        expandButtons.forEach(btn => btn.classList.toggle('expanded', isExpanding));
    }

    function _handleT2CriteriaChange() {
        window.ui.updateT2CriteriaUIState();
    }
    
    function _handleApplyT2Criteria() {
        const criteria = window.ui.readT2CriteriaFromUI();
        window.state.setAppliedT2Criteria(criteria.criteria);
        window.state.setAppliedT2Logic(criteria.logic);
        window.ui.showToast('T2 criteria applied and saved.');
        window.ui.renderApp();
    }
    
    function _handleResetT2Criteria() {
        window.ui.resetT2CriteriaControls();
    }

    function _handlePublicationNavClick(target) {
        const sectionId = target.dataset.sectionId;
        if (sectionId && sectionId !== window.state.getPublicationSection()) {
            window.state.setPublicationSection(sectionId);
            window.ui.renderPublicationTab();
        }
    }
    
    function _handleBruteForceMetricChange(target) {
        const newMetric = target.value;
        if (newMetric !== window.state.getPublicationBruteForceMetric()) {
            window.state.setPublicationBruteForceMetric(newMetric);
            window.ui.renderPublicationTab();
        }
    }
    
    function _handlePublicationEditToggle(target) {
        const isEditing = target.checked;
        if(isEditing !== window.state.getPublicationEditMode()){
            window.state.setPublicationEditMode(isEditing);
            window.ui.renderPublicationTab();
        }
    }
    
    function _handlePublicationSave() {
        const editor = document.getElementById('publication-content-editor');
        if(editor){
            window.state.setEditedManuscriptHTML(editor.innerHTML);
            window.state.setPublicationEditMode(false);
            window.ui.renderPublicationTab();
            window.ui.showToast('Manuscript changes saved.');
        }
    }

    function _handleStatsLayoutChange(target) {
        const newLayout = target.value;
        if (newLayout !== window.state.getStatsLayout()) {
            window.state.setStatsLayout(newLayout);
            window.ui.renderStatisticsTab();
        }
    }
    
    function _handleComparisonViewChange(target) {
        const newView = target.value;
        if (newView !== window.state.getComparisonView()) {
            window.state.setComparisonView(newView);
            window.ui.renderComparisonTab();
        }
    }
    
    function _handleComparisonStudyChange(target) {
        const newStudyId = target.value;
        if (newStudyId !== window.state.getComparisonStudyId()) {
            window.state.setComparisonStudyId(newStudyId);
            window.ui.renderComparisonTab();
        }
    }

    function _handleStartBruteForce() {
        const metric = document.getElementById('brute-force-metric')?.value;
        if(metric) {
            window.bruteForceManager.start(window.state.getCurrentCohort(), metric);
        }
    }

    function _handleCancelBruteForce() {
        window.bruteForceManager.cancel();
    }
    
    function _handleShowBruteForceDetails() {
        const cohortId = window.state.getCurrentCohort();
        const metric = document.getElementById('brute-force-metric')?.value;
        const resultsData = window.bruteForceManager.getResults(cohortId, metric);

        if(resultsData) {
            const modalBody = window.uiComponents.createBruteForceModalContent(resultsData);
            window.ui.showModal('Brute-Force Top Results', modalBody, 'modal-xl');
        } else {
            window.ui.showToast('No results available for this metric and cohort.', 'error');
        }
    }
    
    function _handleApplyBestBruteForceCriteria(target) {
        const cohortId = window.state.getCurrentCohort();
        const metric = target.dataset.metric;
        const resultsData = window.bruteForceManager.getResults(cohortId, metric);
        if (resultsData && resultsData.bestResult) {
            window.ui.setT2CriteriaControls(resultsData.bestResult.criteria, resultsData.bestResult.logic);
            window.ui.showToast(`Best criteria for '${metric}' loaded into panel.`);
        } else {
            window.ui.showToast('No saved best result to apply.', 'error');
        }
    }

    function _handleApplySavedBruteForceCriteria(target) {
        const cohortId = target.dataset.cohort;
        const metric = target.dataset.metric;
        const bfResult = window.bruteForceManager.getAllResults()?.[cohortId]?.[metric];
        
        if (bfResult && bfResult.bestResult) {
            window.state.setAppliedT2Criteria(bfResult.bestResult.criteria);
            window.state.setAppliedT2Logic(bfResult.bestResult.logic);
            window.ui.renderApp();
            window.ui.showToast(`Saved optimal criteria for '${metric}' in '${getCohortDisplayName(cohortId)}' cohort have been applied.`);
        } else {
            window.ui.showToast('Could not find saved criteria to apply.', 'error');
        }
    }

    function _handleInsightsViewChange(target) {
        const newView = target.value;
        if (newView !== window.state.getInsightsView()) {
            window.state.setInsightsView(newView);
            window.insightsTab.renderView(window.state.getAllPublicationStats(), window.state.getFullProcessedData());
            window.ui.initializeTooltips();
        }
    }
    
    function _handleInsightsMismatchStudyChange(target) {
        const newStudyId = target.value;
        if (newStudyId !== window.state.getInsightsMismatchStudyId()) {
            window.state.setInsightsMismatchStudyId(newStudyId);
            window.insightsTab.renderMismatchAnalysis(window.state.getAllPublicationStats(), window.state.getFullProcessedData());
            window.ui.initializeTooltips();
        }
    }
    
    function _handleInsightsDiagnosticPowerCohortChange(target) {
        const newCohort = target.value;
        if (newCohort !== window.state.getInsightsDiagnosticPowerCohort()) {
            window.state.setInsightsDiagnosticPowerCohort(newCohort);
            window.insightsTab.renderDiagnosticPowerAnalysis(window.state.getAllPublicationStats());
        }
    }

    function _handleMismatchDetailsClick(target) {
        const mismatchKey = target.dataset.mismatchKey;
        const mismatchData = window.state.getMismatchData();
        if(!mismatchData || !mismatchData[mismatchKey]) return;

        const patientData = mismatchData[mismatchKey];
        if(patientData.length === 0) {
            window.ui.showToast('No patients in this category.', 'info');
            return;
        }

        const title = target.querySelector('.mismatch-label').textContent || 'Patient Details';
        const modalBody = window.ui.createPatientDetailTableHTML(patientData);
        window.ui.showModal(title, modalBody, 'modal-lg');
    }

    function _handleExportClick(target) {
        const exportType = target.id.replace('btn-export-', '');
        window.exporter.export(exportType, window.state.getAllPublicationStats(), commonData.getPublicationData());
    }

    function init() {
        appContainer = document.getElementById('app-container');
        if (!appContainer) {
            console.error("App container not found. Event listeners cannot be attached.");
            return;
        }

        debouncedResize = _debounce(() => {
            if (window.state.getActiveTabId() === 'statistics' || window.state.getActiveTabId() === 'insights') {
                window.ui.renderApp();
            }
        }, window.APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
        window.addEventListener('resize', debouncedResize);

        appContainer.addEventListener('click', (e) => {
            const target = e.target;
            const link = target.closest('a.nav-link[data-bs-toggle="tab"]');
            const sorter = target.closest('th[data-sort-key]');
            const expandButton = target.closest('.expand-button');
            const expandAllButton = target.closest('.expand-all-button');
            const pubNavLink = target.closest('.publication-section-link');
            const savePubButton = target.closest('#btn-save-publication');
            const applyCriteriaButton = target.closest('#btn-apply-criteria');
            const resetCriteriaButton = target.closest('#btn-reset-criteria');
            const startBfButton = target.closest('#btn-start-brute-force');
            const cancelBfButton = target.closest('#btn-cancel-brute-force');
            const showBfDetailsButton = target.closest('#btn-show-bf-details');
            const applyBestBfButton = target.closest('#btn-apply-best-bf-criteria');
            const applySavedBfButton = target.closest('[data-action="apply-saved-bf"]');
            const mismatchCell = target.closest('[data-action="show-mismatch-details"]');
            const exportButton = target.closest('[id^="btn-export-"]');
            const rowWithDetails = target.closest('tr[data-patient-id]');

            if (link) { e.preventDefault(); _handleTabClick(link); return; }
            if (sorter) { _handleSortClick(sorter); return; }
            if (expandButton) { _handleExpandRowClick(expandButton); return; }
            if (expandAllButton) { _handleExpandAllClick(expandAllButton); return; }
            if (pubNavLink) { e.preventDefault(); _handlePublicationNavClick(pubNavLink); return; }
            if (savePubButton) { _handlePublicationSave(); return; }
            if (applyCriteriaButton) { _handleApplyT2Criteria(); return; }
            if (resetCriteriaButton) { _handleResetT2Criteria(); return; }
            if (startBfButton) { _handleStartBruteForce(); return; }
            if (cancelBfButton) { _handleCancelBruteForce(); return; }
            if (showBfDetailsButton) { _handleShowBruteForceDetails(); return; }
            if (applyBestBfButton) { _handleApplyBestBruteForceCriteria(applyBestBfButton); return; }
            if (applySavedBfButton) { _handleApplySavedBruteForceCriteria(applySavedBfButton); return; }
            if (mismatchCell) { _handleMismatchDetailsClick(mismatchCell); return; }
            if (exportButton) { _handleExportClick(exportButton); return; }
            if (rowWithDetails) {
                const button = rowWithDetails.querySelector('.expand-button');
                if (button && !target.closest('a, button')) {
                    _handleExpandRowClick(button);
                    return;
                }
            }
        });

        appContainer.addEventListener('change', (e) => {
            const target = e.target;
            const cohortSelect = target.closest('.cohort-select');
            const criteriaCheckbox = target.closest('.criteria-checkbox');
            const pubBfMetricSelect = target.closest('#publication-bf-metric-select');
            const pubEditToggle = target.closest('#publication-edit-toggle');
            const statsLayoutRadio = target.closest('input[name="statsLayout"]');
            const comparisonViewRadio = target.closest('input[name="comparisonView"]');
            const comparisonStudySelect = target.closest('#comparison-study-select');
            const insightsViewRadio = target.closest('input[name="insightsView"]');
            const insightsMismatchSelect = target.closest('#mismatch-analysis-study-select');
            const insightsPowerCohortSelect = target.closest('#diagnostic-power-cohort-select');

            if (cohortSelect) { _handleCohortChange(cohortSelect); return; }
            if (criteriaCheckbox) { _handleT2CriteriaChange(); return; }
            if (pubBfMetricSelect) { _handleBruteForceMetricChange(pubBfMetricSelect); return; }
            if (pubEditToggle) { _handlePublicationEditToggle(pubEditToggle); return; }
            if (statsLayoutRadio) { _handleStatsLayoutChange(statsLayoutRadio); return; }
            if (comparisonViewRadio) { _handleComparisonViewChange(comparisonViewRadio); return; }
            if (comparisonStudySelect) { _handleComparisonStudyChange(comparisonStudySelect); return; }
            if (insightsViewRadio) { _handleInsightsViewChange(insightsViewRadio); return; }
            if (insightsMismatchSelect) { _handleInsightsMismatchStudyChange(insightsMismatchSelect); return; }
            if (insightsPowerCohortSelect) { _handleInsightsDiagnosticPowerCohortChange(insightsPowerCohortSelect); return; }
        });

        appContainer.addEventListener('input', (e) => {
            const target = e.target;
            const criteriaControl = target.closest('.criteria-range, .criteria-input-manual, .t2-criteria-button, #t2-logic-switch');
            if (criteriaControl) {
                if (target.id === 'range-size' || target.id === 'input-size') {
                    const value = target.value;
                    document.getElementById('range-size').value = value;
                    document.getElementById('input-size').value = value;
                    document.getElementById('value-size').textContent = formatNumber(value, 1);
                }
            }
        });
    }

    return Object.freeze({
        init
    });
})();
