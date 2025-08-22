window.generators.abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<div class="alert alert-warning">Required statistics for abstract generation are missing. Please ensure the analysis has been run.</div>';
        }

        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;
        
        const perfAS = overallStats.performanceAS;
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        
        let resultsSectionHTML = '<p>Results could not be generated due to missing statistical data.</p>';

        if (perfAS && bfResultForPub && bfComparisonForPub) {
            const meanAgeFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.mean, 1);
            const ageSDFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.sd, 1);
            const nPositiveText = helpers.formatMetricForPublication({ value: nPositive / nOverall, n_success: nPositive, n_trials: nOverall }, 'acc', { includeCI: false, includeCount: true });

            const asAucText = helpers.formatMetricForPublication(perfAS.auc, 'auc');
            const bfAucText = helpers.formatMetricForPublication(bfResultForPub.auc, 'auc');
            const pValueText = helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue);

            const findingsSentence = `A total of ${nOverall} patients (mean age, ${meanAgeFormatted} years ± ${ageSDFormatted}; ${overallStats.descriptive.sex.m} men) were evaluated, of whom ${nPositiveText} had positive nodes at histopathology. For the overall cohort, the Avocado Sign yielded an area under the receiver operating characteristic curve (AUC) of ${asAucText}, which was superior to that of a computationally optimized T2-based benchmark (AUC, ${bfAucText}; ${pValueText}) and established literature-based criteria.`;
            
            resultsSectionHTML = `<p>${findingsSentence}</p>`;
        }
        
        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate MRI-based staging of mesorectal lymph nodes in rectal cancer is crucial for treatment planning, but standard T2-weighted criteria have shown limited diagnostic performance.</p>
                
                <h3>Purpose</h3>
                <p>To compare the diagnostic performance of a contrast-enhanced MRI feature (the Avocado Sign) with that of multiple T2-weighted criteria for predicting patient-level mesorectal nodal status in rectal cancer.</p>
                
                <h3>Materials and Methods</h3>
                <p>This secondary analysis of a retrospective, single-institution study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with rectal cancer who underwent 3.0-T MRI between November 2015 and March 2025 were analyzed. Two blinded radiologists evaluated the Avocado Sign on contrast-enhanced T1-weighted images. The performance of this sign was compared against two sets of T2-based criteria: (a) a computationally optimized, data-driven benchmark derived from the study cohort and (b) established criteria from the literature. Histopathologic analysis served as the reference standard. The DeLong test was used to compare the area under the receiver operating characteristic curve (AUC).</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                <p>The contrast-enhanced Avocado Sign demonstrated superior diagnostic performance for predicting the patient-level mesorectal nodal status compared with both optimized and literature-based T2-weighted criteria, providing a robust and simplified alternative for nodal staging in rectal cancer.</p>
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();