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
        
        let objectivesParagraph = '<p>Objectives could not be generated due to missing statistical data.</p>';
        let methodsParagraph = '<p>Methods could not be generated due to missing statistical data.</p>';
        let resultsParagraph = '<p>Results could not be generated due to missing statistical data.</p>';
        let conclusionParagraph = '<p>Conclusion could not be generated due to missing statistical data.</p>';
        let clinicalRelevanceParagraph = '';

        if (perfAS && bfResultForPub && bfComparisonForPub) {
            const meanAgeFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.mean, 1);
            const ageSDFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.sd, 1);
            const nPositiveText = helpers.formatMetricForPublication({ value: nPositive / nOverall, n_success: nPositive, n_trials: nOverall }, 'acc', { includeCI: false, includeCount: true });

            const asAucText = helpers.formatMetricForPublication(perfAS.auc, 'auc');
            const asSensText = helpers.formatMetricForPublication(perfAS.sens, 'sens', { includeCI: false, includeCount: true });
            const asSpecText = helpers.formatMetricForPublication(perfAS.spec, 'spec', { includeCI: false, includeCount: true });
            const bfAucText = helpers.formatMetricForPublication(bfResultForPub.auc, 'auc');
            const pValueText = helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue);

            objectivesParagraph = `<p>To determine whether the contrast-enhanced Avocado Sign provides higher diagnostic accuracy than contemporary T2-weighted criteria for predicting patient-level mesorectal nodal status in rectal cancer, in accordance with European Radiology and STARD reporting recommendations.</p>`;

            methodsParagraph = `<p>In this retrospective, single-centre study, ${nOverall} consecutive patients with rectal cancer who underwent 3.0-T MRI between November 2015 and March 2025 were analysed. The study was approved by the institutional ethics committee with a waiver of additional informed consent. Two abdominal radiologists, blinded to pathology and each other, independently assessed the Avocado Sign on contrast-enhanced Dixon-VIBE images in dedicated sessions. Diagnostic performance was benchmarked against (i) exhaustive brute-force optimisation of T2-weighted morphologic combinations for a predefined metric and (ii) guideline-derived literature criteria applied to the appropriate cohorts. Histopathology from total mesorectal excision served as the reference standard. Confidence intervals were computed with Wilson or bootstrap methods, and AUCs were compared using the DeLong test.</p>`;

            resultsParagraph = `<p>A total of ${nOverall} patients (mean age, ${meanAgeFormatted} years ± ${ageSDFormatted}; ${overallStats.descriptive.sex.m} men) were evaluated, with ${nPositiveText} harbouring nodal metastases. The Avocado Sign yielded an AUC of ${asAucText}, sensitivity of ${asSensText}, and specificity of ${asSpecText}. The best-performing, data-driven T2 benchmark achieved an AUC of ${bfAucText}, remaining inferior to the Avocado Sign (${pValueText}). Superiority was consistently observed when compared with established literature criteria.</p>`;

            conclusionParagraph = `<p>The contrast-enhanced Avocado Sign demonstrated superior diagnostic performance over both optimised and literature-based T2-weighted criteria for mesorectal nodal staging, supporting its integration as a binary, reproducible marker in rectal MRI workflows.</p>`;

            clinicalRelevanceParagraph = `<p style="margin-top: 1rem;"><strong>Clinical relevance statement:</strong> A dedicated contrast-enhanced assessment for the Avocado Sign may improve risk stratification and treatment planning for patients considered for neoadjuvant therapy.</p>`;
        }

        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Objectives</h3>
                ${objectivesParagraph}

                <h3>Methods</h3>
                ${methodsParagraph}

                <h3>Results</h3>
                ${resultsParagraph}

                <h3>Conclusion</h3>
                ${conclusionParagraph}
                ${clinicalRelevanceParagraph}
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();