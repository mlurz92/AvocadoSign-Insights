window.publicationTab = (() => {

    function renderWordCounts() {
        const contentArea = document.getElementById('publication-content-area');
        if (!contentArea) return;

        // Calculate and display total word count
        const totalCountContainer = document.getElementById('total-word-count-container');
        const contentWrapper = document.getElementById('publication-content-wrapper');
        if (totalCountContainer && contentWrapper) {
            const sectionsToCount = Array.from(contentWrapper.querySelectorAll('section[id]'));
            let totalWords = 0;
            sectionsToCount.forEach(section => {
                 // Exclude references and STARD checklist from the main word count
                if (section.id !== 'references_main' && section.id !== 'stard_checklist') {
                    const text = section.textContent || section.innerText || '';
                    totalWords += text.trim().split(/\s+/).filter(Boolean).length;
                }
            });
            totalCountContainer.innerHTML = `<span>Total Manuscript Words: <span class="badge bg-primary rounded-pill">${totalWords}</span></span>`;
        }

        // Calculate and display per-section counts
        const sectionsWithCounts = window.PUBLICATION_CONFIG.sections.filter(s => s.countType);
        sectionsWithCounts.forEach(section => {
            const contentElement = contentArea.querySelector(`#${section.id}`);
            const navElement = document.querySelector(`.publication-section-link[data-section-id="${section.id}"]`);

            if (contentElement && navElement) {
                let currentCount = 0;
                
                if (section.countType === 'word') {
                    const text = contentElement.textContent || contentElement.innerText || '';
                    currentCount = text.trim().split(/\s+/).filter(Boolean).length;
                } else if (section.countType === 'item') {
                    currentCount = contentElement.querySelectorAll('li').length;
                }

                let countIndicator = navElement.querySelector('.word-count-indicator');
                if (!countIndicator) {
                    countIndicator = document.createElement('span');
                    navElement.appendChild(countIndicator);
                }
                
                countIndicator.textContent = `${currentCount}`;
                countIndicator.className = 'badge bg-secondary-subtle text-secondary-emphasis rounded-pill ms-2 word-count-indicator';
            }
        });
    }

    function render(data, currentSectionId, editMode, editedHTML) {
        const { preRenderedHTML, allCohortStats, bruteForceMetricForPublication } = data;
        
        const manuscriptContent = editedHTML || preRenderedHTML;
        
        if (!manuscriptContent) {
            return '<div class="alert alert-warning">Publication content could not be rendered. Please check for errors.</div>';
        }
        
        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: var(--sticky-header-offset);">
                        <div id="publication-edit-controls" class="mb-3 d-flex justify-content-between">
                             <button id="btn-edit-publication" class="btn btn-sm btn-outline-secondary" data-tippy-content="Enable manual editing of the manuscript text.">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                            <button id="btn-save-publication" class="btn btn-sm btn-primary" style="display: none;" data-tippy-content="Save your changes to the browser's local storage.">
                                <i class="fas fa-save me-1"></i> Save
                            </button>
                            <button id="btn-reset-publication" class="btn btn-sm btn-outline-danger" style="display: none;" data-tippy-content="Discard your changes and revert to the auto-generated manuscript.">
                                <i class="fas fa-undo me-1"></i> Reset
                            </button>
                        </div>
                        ${window.uiComponents.createPublicationNav(currentSectionId, editMode)}
                        <div class="mt-3">
                            <label for="publication-bf-metric-select" class="form-label small text-muted">${window.APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="publication-bf-metric-select">
                                ${window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <div id="publication-content-wrapper" class="publication-content-wrapper">
                            ${manuscriptContent}
                        </div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => {
            const flowchartContainerId = 'figure-1-flowchart-container';
            if (document.getElementById(flowchartContainerId)) {
                if (typeof window.flowchartRenderer !== 'undefined' && allCohortStats?.Overall) {
                    const flowchartStats = {
                        Overall: allCohortStats[window.APP_CONFIG.COHORTS.OVERALL.id],
                        surgeryAlone: allCohortStats[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id],
                        neoadjuvantTherapy: allCohortStats[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]
                    };
                    window.flowchartRenderer.renderFlowchart(flowchartStats, flowchartContainerId);
                }
            }
            renderWordCounts();
            window.uiManager.updatePublicationEditModeUI(editMode);

            const contentArea = document.getElementById('publication-content-area');
            const elementToScroll = document.getElementById(currentSectionId);
            if (contentArea && elementToScroll) {
                const offsetTop = elementToScroll.offsetTop - contentArea.offsetTop;
                contentArea.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, 50);
            
        return finalHTML;
    }

    return Object.freeze({
        render,
        renderWordCounts
    });

})();