window.state = (() => {
    let appState = {};
    let fullProcessedData = [];
    let allPublicationStats = {};
    let mismatchData = {};

    function _getInitialState() {
        return {
            currentCohort: window.APP_CONFIG.DEFAULT_SETTINGS.COHORT,
            appliedT2Criteria: getDefaultT2Criteria(),
            appliedT2Logic: window.APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
            activeTabId: window.APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID,
            dataTableSort: { ...window.APP_CONFIG.DEFAULT_SETTINGS.DATA_TABLE_SORT },
            analysisTableSort: { ...window.APP_CONFIG.DEFAULT_SETTINGS.ANALYSIS_TABLE_SORT },
            statsLayout: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            statsCohort1: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT1,
            statsCohort2: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT2,
            comparisonView: window.APP_CONFIG.DEFAULT_SETTINGS.COMPARISON_VIEW,
            comparisonStudyId: window.APP_CONFIG.DEFAULT_SETTINGS.COMPARISON_STUDY_ID,
            insightsView: window.APP_CONFIG.DEFAULT_SETTINGS.INSIGHTS_VIEW,
            insightsMismatchStudyId: window.APP_CONFIG.DEFAULT_SETTINGS.INSIGHTS_MISMATCH_STUDY_ID,
            insightsDiagnosticPowerCohort: window.APP_CONFIG.DEFAULT_SETTINGS.INSIGHTS_DIAGNOSTIC_POWER_COHORT,
            publicationSection: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_SECTION,
            publicationBruteForceMetric: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC,
            publicationLang: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_LANG,
            publicationEditMode: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_EDIT_MODE,
            editedManuscriptHTML: window.APP_CONFIG.DEFAULT_SETTINGS.EDITED_MANUSCRIPT_HTML
        };
    }

    function _saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error saving state for key ${key} to localStorage:`, e);
        }
    }

    function _loadFromLocalStorage(key, defaultValue) {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue === null || storedValue === 'undefined') {
                return defaultValue;
            }
            return JSON.parse(storedValue);
        } catch (e) {
            console.error(`Error loading state for key ${key} from localStorage:`, e);
            return defaultValue;
        }
    }

    function loadState() {
        const initialState = _getInitialState();
        appState = {
            currentCohort: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT, initialState.currentCohort),
            appliedT2Criteria: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, initialState.appliedT2Criteria),
            appliedT2Logic: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, initialState.appliedT2Logic),
            activeTabId: _loadFromLocalStorage('avocadoSign_activeTabId_v5.3', initialState.activeTabId),
            dataTableSort: _loadFromLocalStorage('avocadoSign_dataTableSort_v5.3', initialState.dataTableSort),
            analysisTableSort: _loadFromLocalStorage('avocadoSign_analysisTableSort_v5.3', initialState.analysisTableSort),
            statsLayout: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, initialState.statsLayout),
            statsCohort1: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT1, initialState.statsCohort1),
            statsCohort2: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT2, initialState.statsCohort2),
            comparisonView: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.COMPARISON_VIEW, initialState.comparisonView),
            comparisonStudyId: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID, initialState.comparisonStudyId),
            insightsView: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_VIEW, initialState.insightsView),
            insightsMismatchStudyId: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_MISMATCH_STUDY_ID, initialState.insightsMismatchStudyId),
            insightsDiagnosticPowerCohort: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_DIAGNOSTIC_POWER_COHORT, initialState.insightsDiagnosticPowerCohort),
            publicationSection: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION, initialState.publicationSection),
            publicationBruteForceMetric: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC, initialState.publicationBruteForceMetric),
            publicationLang: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG, initialState.publicationLang),
            publicationEditMode: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_EDIT_MODE, initialState.publicationEditMode),
            editedManuscriptHTML: _loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.EDITED_MANUSCRIPT_HTML, initialState.editedManuscriptHTML)
        };
    }

    const setFullProcessedData = (data) => { fullProcessedData = data; };
    const getFullProcessedData = () => fullProcessedData;
    const setAllPublicationStats = (stats) => { allPublicationStats = stats; };
    const getAllPublicationStats = () => allPublicationStats;
    const setMismatchData = (data) => { mismatchData = data; };
    const getMismatchData = () => mismatchData;

    const createSetter = (key, storageKey) => (value) => {
        appState[key] = value;
        if (storageKey) {
            _saveToLocalStorage(storageKey, value);
        }
    };
    
    const createGetter = (key) => () => appState[key];
    
    const setters = {
        setCurrentCohort: createSetter('currentCohort', window.APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT),
        setAppliedT2Criteria: createSetter('appliedT2Criteria', window.APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA),
        setAppliedT2Logic: createSetter('appliedT2Logic', window.APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC),
        setActiveTabId: createSetter('activeTabId', 'avocadoSign_activeTabId_v5.3'),
        setDataTableSort: createSetter('dataTableSort', 'avocadoSign_dataTableSort_v5.3'),
        setAnalysisTableSort: createSetter('analysisTableSort', 'avocadoSign_analysisTableSort_v5.3'),
        setStatsLayout: createSetter('statsLayout', window.APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT),
        setStatsCohort1: createSetter('statsCohort1', window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT1),
        setStatsCohort2: createSetter('statsCohort2', window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT2),
        setComparisonView: createSetter('comparisonView', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_VIEW),
        setComparisonStudyId: createSetter('comparisonStudyId', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID),
        setInsightsView: createSetter('insightsView', window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_VIEW),
        setInsightsMismatchStudyId: createSetter('insightsMismatchStudyId', window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_MISMATCH_STUDY_ID),
        setInsightsDiagnosticPowerCohort: createSetter('insightsDiagnosticPowerCohort', window.APP_CONFIG.STORAGE_KEYS.INSIGHTS_DIAGNOSTIC_POWER_COHORT),
        setPublicationSection: createSetter('publicationSection', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION),
        setPublicationBruteForceMetric: createSetter('publicationBruteForceMetric', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC),
        setPublicationLang: createSetter('publicationLang', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG),
        setPublicationEditMode: createSetter('publicationEditMode', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_EDIT_MODE),
        setEditedManuscriptHTML: createSetter('editedManuscriptHTML', window.APP_CONFIG.STORAGE_KEYS.EDITED_MANUSCRIPT_HTML)
    };

    const getters = {
        getCurrentCohort: createGetter('currentCohort'),
        getAppliedT2Criteria: createGetter('appliedT2Criteria'),
        getAppliedT2Logic: createGetter('appliedT2Logic'),
        getActiveTabId: createGetter('activeTabId'),
        getDataTableSort: createGetter('dataTableSort'),
        getAnalysisTableSort: createGetter('analysisTableSort'),
        getStatsLayout: createGetter('statsLayout'),
        getStatsCohort1: createGetter('statsCohort1'),
        getStatsCohort2: createGetter('statsCohort2'),
        getComparisonView: createGetter('comparisonView'),
        getComparisonStudyId: createGetter('comparisonStudyId'),
        getInsightsView: createGetter('insightsView'),
        getInsightsMismatchStudyId: createGetter('insightsMismatchStudyId'),
        getInsightsDiagnosticPowerCohort: createGetter('insightsDiagnosticPowerCohort'),
        getPublicationSection: createGetter('publicationSection'),
        getPublicationBruteForceMetric: createGetter('publicationBruteForceMetric'),
        getPublicationLang: createGetter('publicationLang'),
        getPublicationEditMode: createGetter('publicationEditMode'),
        getEditedManuscriptHTML: createGetter('editedManuscriptHTML')
    };
    
    function updateSort(tableType, key, subKey = null) {
        const sortState = tableType === 'data' ? getters.getDataTableSort() : getters.getAnalysisTableSort();
        const setSortState = tableType === 'data' ? setters.setDataTableSort : setters.setAnalysisTableSort;
        
        let newDirection = 'asc';
        if (sortState.key === key && sortState.subKey === subKey) {
            newDirection = sortState.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortState({ key: key, direction: newDirection, subKey: subKey });
    }

    return Object.freeze({
        loadState,
        ...setters,
        ...getters,
        updateSort,
        setFullProcessedData,
        getFullProcessedData,
        setAllPublicationStats,
        getAllPublicationStats,
        setMismatchData,
        getMismatchData
    });

})();
