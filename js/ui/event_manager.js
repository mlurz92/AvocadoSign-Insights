window.eventManager = (() => {
    let app;

    const debouncedUpdateSizeInput = debounce(value => {
        if (window.t2CriteriaManager.updateCriterionThreshold(value)) {
            if (!window.t2CriteriaManager.getCurrentCriteria().size?.active) {
                window.t2CriteriaManager.toggleCriterionActive('size', true);
            }
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }, window.APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
    
    const debouncedUpdateWordCount = debounce(() => {
        if(window.publicationTab) {
            window.publicationTab.renderWordCounts();
        }
    }, 500);

    const debouncedPowerAnalysisRender = debounce(() => {
        if (window.insightsTab) {
            window.insightsTab.renderPowerAnalysis(app.allPublicationStats);
        }
    }, 350);

    function init(appInstance) {
        app = appInstance;
        document.body.addEventListener('click', handleBodyClick);
        document.body.addEventListener('change', handleBodyChange);
        document.body.addEventListener('input', handleBodyInput);
        const mainTabEl = document.getElementById('main-tabs');
        if (mainTabEl) {
            mainTabEl.addEventListener('shown.bs.tab', handleTabShown);
        }
    }

    function handleTabShown(event) {
        if (event.target?.id) {
            app.processTabChange(event.target.id.replace('-tab', ''));
        }
    }

    function handleBodyClick(event) {
        const target = event.target;
        const button = target.closest('button');

        if (button?.dataset.cohort && !button.disabled && !button.dataset.action) {
            app.handleCohortChange(button.dataset.cohort, "user");
            return;
        }

        if (target.closest('th[data-sort-key]')) {
            const header = target.closest('th[data-sort-key]');
            const subHeader = target.closest('.sortable-sub-header');
            handleSortClick(header, subHeader);
            return;
        }

        if (target.closest('.publication-section-link')) {
            event.preventDefault();
            app.handlePublicationSectionChange(target.closest('.publication-section-link').dataset.sectionId);
            return;
        }
        
        if (!button || button.disabled) return;
        
        if (button.dataset.action === 'apply-saved-bf') {
            app.applyBestBruteForceCriteria(button.dataset.metric, button.dataset.cohort);
            return;
        }

        const singleClickActions = {
            'btn-quick-guide': () => window.uiManager.showQuickGuide(),
            'data-toggle-details': () => window.uiManager.toggleAllDetails('data-table-body', button.id),
            'analysis-toggle-details': () => window.uiManager.toggleAllDetails('analysis-table-body', button.id),
            'btn-reset-criteria': () => {
                window.t2CriteriaManager.resetCriteria();
                window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
                window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
                window.uiManager.showToast('T2 criteria have been reset to default.', 'info');
            },
            'btn-apply-criteria': () => app.applyAndRefreshAll(),
            'btn-start-brute-force': () => app.startBruteForceAnalysis(),
            'btn-cancel-brute-force': () => window.bruteForceManager.cancelAnalysis(),
            'btn-apply-best-bf-criteria': () => {
                if (button.dataset.metric) {
                    app.applyBestBruteForceCriteria(button.dataset.metric);
                }
            },
            'btn-show-bf-details': () => {
                 const metricSelect = document.getElementById('brute-force-metric');
                 if (metricSelect) app.showBruteForceDetails(metricSelect.value);
            },
            'statistics-toggle-single': () => handleStatsLayoutToggle('einzel'),
            'statistics-toggle-comparison': () => handleStatsLayoutToggle('vergleich'),
            'btn-export-manuscript-md': () => app.exportManuscript(),
            'btn-export-tables-md': () => app.exportTables(),
            'btn-export-charts-svg': () => app.exportCharts(),
            'btn-edit-publication': () => handlePublicationEditStart(),
            'btn-save-publication': () => handlePublicationSave(),
            'btn-reset-publication': () => handlePublicationReset(),
            'btn-confirm-auto-bf': () => app.startSequentialBruteForce(),
            'btn-decline-auto-bf': () => app.declineAutoBruteForce()
        };

        if (singleClickActions[button.id]) {
            singleClickActions[button.id]();
            return;
        }
        
        if (button.classList.contains('t2-criteria-button')) {
            if (window.t2CriteriaManager.updateCriterionValue(button.dataset.criterion, button.dataset.value)) {
                window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
                window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
            }
            return;
        }
    }

    function handleBodyChange(event) {
        const target = event.target;
        if (target.classList.contains('criteria-checkbox')) {
            handleT2CheckboxChange(target);
            return;
        }
        
        const changeActions = {
            't2-logic-switch': () => handleT2LogicChange(target),
            'brute-force-metric': () => app.refreshCurrentTab(),
            'statistics-cohort-select-1': () => handleStatsCohortChange(target),
            'statistics-cohort-select-2': () => handleStatsCohortChange(target),
            'comp-study-select': () => handleComparisonStudyChange(target.value),
            'publication-bf-metric-select': () => handlePublicationBfMetricChange(target.value),
            'power-analysis-study-select': () => handlePowerAnalysisStudyChange(target.value),
            'node-count-lit-set-select': () => handleNodeCountLitSetChange(target.value),
            'power-mode-posthoc': () => window.insightsTab.renderPowerAnalysis(app.allPublicationStats),
            'power-mode-samplesize': () => window.insightsTab.renderPowerAnalysis(app.allPublicationStats)
        };
        
        if (changeActions[target.id]) {
            changeActions[target.id]();
            return;
        }

        if (target.name === 'comparisonView') {
            handleComparisonViewChange(target.value);
            return;
        }
        if (target.name === 'insightsView') {
            handleInsightsViewChange(target.value);
            return;
        }
    }

    function handleBodyInput(event) {
        const target = event.target;
        if (target.id === 'range-size' || target.id === 'input-size') {
            const sizeValueDisplay = document.getElementById('value-size');
            const sizeRangeInput = document.getElementById('range-size');
            const sizeManualInput = document.getElementById('input-size');
            const newValue = formatNumber(target.value, 1, '', true);

            if (target.id === 'range-size') {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeManualInput) sizeManualInput.value = newValue;
            } else {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeRangeInput) sizeRangeInput.value = parseFloat(newValue);
            }
            debouncedUpdateSizeInput(newValue);
        } else if (target.id === 'publication-content-wrapper') {
            debouncedUpdateWordCount();
        } else if (['power-alpha', 'power-target', 'power-effect-size'].includes(target.id)) {
            debouncedPowerAnalysisRender();
        }
    }

    function handleSortClick(header, subHeader) {
        const key = header.dataset.sortKey;
        if (!key) return;
        const subKey = subHeader?.dataset.subKey || null;
        const tableId = header.closest('table')?.id;
        const context = tableId === 'data-table' ? 'data' : 'analysis';
        app.handleSortRequest(context, key, subKey);
    }

    function handleT2CheckboxChange(checkbox) {
        if (window.t2CriteriaManager.toggleCriterionActive(checkbox.value, checkbox.checked)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2LogicChange(logicSwitch) {
        const newLogic = logicSwitch.checked ? 'OR' : 'AND';
        if (window.t2CriteriaManager.updateLogic(newLogic)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }

    function handleStatsLayoutToggle(newLayout) {
        if (window.state.setStatsLayout(newLayout)) {
            app.refreshCurrentTab();
        }
    }

    function handleStatsCohortChange(selectElement) {
        const newValue = selectElement.value;
        let needsRender = false;
        if (selectElement.id === 'statistics-cohort-select-1') {
            needsRender = window.state.setStatsCohort1(newValue);
        } else if (selectElement.id === 'statistics-cohort-select-2') {
            needsRender = window.state.setStatsCohort2(newValue);
        }
        if (needsRender && window.state.getStatsLayout() === 'vergleich') {
            app.refreshCurrentTab();
        }
    }

    function handleComparisonViewChange(view) {
        if (window.state.setComparisonView(view)) {
            app.refreshCurrentTab();
        }
    }

    function handleComparisonStudyChange(studyId) {
        if (window.state.setComparisonStudyId(studyId)) {
            app.refreshCurrentTab();
        }
    }
    
    function handleInsightsViewChange(view) {
        if (window.state.setInsightsView(view)) {
            app.refreshCurrentTab();
        }
    }

    function handlePowerAnalysisStudyChange(studyId) {
        if (window.state.setInsightsPowerStudyId(studyId)) {
            if(window.insightsTab) window.insightsTab.renderPowerAnalysis(app.allPublicationStats);
        }
    }

    function handleNodeCountLitSetChange(studyId) {
        if (window.state.setInsightsLiteratureSetId(studyId)) {
            if (window.insightsTab) window.insightsTab.renderNodeCountAnalysis(app.allPublicationStats);
        }
    }
    
    function handlePublicationBfMetricChange(newMetric) {
        if (window.state.setPublicationBruteForceMetric(newMetric)) {
            app.refreshCurrentTab();
        }
    }

    function handlePublicationEditStart() {
        if (window.state.setPublicationEditMode(true)) {
            window.uiManager.updatePublicationEditModeUI(true);
            const contentWrapper = document.getElementById('publication-content-wrapper');
            if (contentWrapper) {
                contentWrapper.focus();
            }
        }
    }

    function handlePublicationSave() {
        const contentWrapper = document.getElementById('publication-content-wrapper');
        if (contentWrapper) {
            window.state.setEditedManuscriptHTML(contentWrapper.innerHTML);
            window.state.setPublicationEditMode(false);
            window.uiManager.updatePublicationEditModeUI(false);
            window.uiManager.showToast('Manuscript changes saved.', 'success');
        }
    }

    function handlePublicationReset() {
        if (window.confirm("Are you sure you want to discard all manual changes and revert to the auto-generated manuscript?")) {
            window.state.resetEditedManuscriptHTML();
            window.state.setPublicationEditMode(false);
            app.refreshCurrentTab();
            window.uiManager.showToast('Manuscript has been reset to the generated version.', 'info');
        }
    }

    return Object.freeze({
        init
    });
})();