window.diagnosticPowerAnalyzer = (() => {

    function analyze(allStats, cohortId) {
        const results = [];
        if (!allStats || !cohortId || !allStats[cohortId]) {
            return results;
        }

        const cohortStats = allStats[cohortId];
        const allLiteratureSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();
        const bruteForceMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;

        // 1. Add Avocado Sign
        if (cohortStats.performanceAS && cohortStats.performanceAS.dor) {
            results.push({
                id: 'AvocadoSign',
                name: 'Avocado Sign',
                dor: cohortStats.performanceAS.dor,
                type: 'Avocado Sign'
            });
        }

        // 2. Add Literature-Based T2 Criteria applicable to the cohort
        allLiteratureSets.forEach(set => {
            if (set.applicableCohort === cohortId) {
                const perf = cohortStats.performanceT2Literature?.[set.id];
                if (perf && perf.dor) {
                    results.push({
                        id: set.id,
                        name: set.displayShortName || set.name,
                        dor: perf.dor,
                        type: 'Literature'
                    });
                }
            }
        });
        
        // 3. Add Brute-Force Optimized T2 Criterion for the cohort
        const bfPerf = cohortStats.performanceT2Bruteforce?.[bruteForceMetric];
        if (bfPerf && bfPerf.dor) {
             results.push({
                id: `bf_${cohortId}`,
                name: `Best-Case T2 (${getCohortDisplayName(cohortId)})`,
                dor: bfPerf.dor,
                type: 'Brute-Force'
            });
        }

        const validResults = results.filter(r => r.dor && isFinite(r.dor.value));
        validResults.sort((a, b) => b.dor.value - a.dor.value);
        
        return validResults;
    }

    return Object.freeze({
        analyze
    });

})();