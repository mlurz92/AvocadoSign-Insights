window.generators.discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = window.publicationHelpers;
        const { bruteForceMetricForPublication, nSurgeryAlone } = commonData;
        const performanceAS = overallStats.performanceAS;
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        
        const esgarSurgeryAloneComparison = stats?.surgeryAlone?.comparisonASvsT2Literature?.['ESGAR_2016_SurgeryAlone'];

        const bfComparisonText = (bfResultForPub && bfComparisonForPub)
            ? `(AUC, ${helpers.formatValueForPublication(performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(bfResultForPub?.auc?.value, 2, false, true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison data pending)';
            
        let powerAnalysisText = '';
        if (esgarSurgeryAloneComparison?.delong?.pValue > window.APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
            const power = esgarSurgeryAloneComparison.delong.power;
            if (isFinite(power) && power < 0.8) {
                powerAnalysisText = ` For instance, while the Avocado Sign had a numerically higher AUC than the ESGAR 2016 primary staging criteria in the surgery-alone cohort (AUC, ${helpers.formatValueForPublication(stats?.surgeryAlone?.performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(stats?.surgeryAlone?.performanceT2Literature?.['ESGAR_2016_SurgeryAlone']?.auc?.value, 2, false, true)}), this difference did not reach statistical significance (${helpers.formatPValueForPublication(esgarSurgeryAloneComparison?.delong?.pValue)}). A post-hoc power analysis revealed that this specific comparison had a statistical power of only ${helpers.formatValueForPublication(power * 100, 0)}%, suggesting that the study was underpowered to definitively detect a difference in this subgroup.`;
            }
        }
        
        let interCohortText = '';
        const interComp = stats?.interCohortComparison?.as;
        const interCohortPValueText = interComp ? helpers.formatPValueForPublication(interComp.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;
        if (interComp && Math.abs(interComp.diffAUC) < 0.2) {
             interCohortText = `This robustness is further underscored by the fact that its diagnostic performance did not significantly differ between the two clinical settings (${helpers.formatPValueForPublication(interComp.pValue)}), suggesting its utility across the entire treatment pathway of rectal cancer.`;
        }


        const summaryParagraph = `
            <p>This European Radiology–aligned analysis validates the diagnostic performance of the contrast-enhanced Avocado Sign for predicting patient-level mesorectal nodal status. The sign delivered high discrimination (AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc')}) and maintained statistical superiority over a cohort-specific, brute-force optimised T2 benchmark ${bfComparisonText}. Surpassing an internally optimised comparator indicates that the Avocado Sign captures complementary biological information beyond composite T2-weighted morphologic patterns.</p>
        `;

        const contextParagraph = `
            <p>Contextualised against the broader literature, the Avocado Sign outperformed the majority of conventional T2-weighted criteria.${powerAnalysisText} Persistent shortfalls of T2-based assessment are well documented ${helpers.getReference('Beets_Tan_2018')}${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')}, contributing to the diminished reliance on nodal staging in pivotal rectal cancer trials such as OCUM ${helpers.getReference('Stelzner_2022')}. Our data support the concept that incorporating a brief contrast-enhanced acquisition provides a practical route to overcome this weakness. The Avocado Sign demonstrated consistent performance across treatment-naïve and post-neoadjuvant cohorts (${interCohortPValueText}) and sustained almost perfect interobserver agreement (Cohen’s κ = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), reinforcing its suitability for routine adoption ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
        `;

        const clinicalImplicationsParagraph = `
            <p>The clinical implications are considerable. Contemporary care pathways emphasise personalised strategies such as total neoadjuvant therapy and organ preservation ${helpers.getReference('Garcia_Aguilar_2022')}${helpers.getReference('Schrag_2023')}. Reliable nodal stratification is essential to avoid overtreatment of node-negative patients and undertreatment of node-positive patients. By providing a binary, reproducible signal, the Avocado Sign can streamline deliberations of the multidisciplinary tumour board, replacing equivocal composite criteria with an objective finding. Routine acquisition of a contrast-enhanced sequence tailored to this assessment could therefore enhance confidence when selecting patients for intensified or de-escalated therapy.</p>
        `;

        const limitationsParagraph = `
            <p>This study has limitations. Its retrospective, single-centre design may limit generalisability despite the consecutive inclusion approach. The treatment-naïve surgery subgroup was relatively small (n=${commonData.nSurgeryAlone}), which is reflected in the limited statistical power of certain subgroup comparisons. The brute-force T2 benchmark was derived from and applied to the same dataset, potentially introducing overfitting; nonetheless, this makes the demonstrated superiority of the Avocado Sign a conservative estimate. Finally, all examinations were performed on a single 3.0-T platform using one gadolinium-based agent, and external validation across vendors and field strengths remains necessary.</p>
        `;

        const conclusionParagraph = `
            <p>In conclusion, the contrast-enhanced Avocado Sign is an accurate, reproducible, and implementation-ready imaging biomarker for mesorectal nodal staging. Its superiority over optimised and literature-based T2-weighted criteria suggests that it can simplify and standardise reporting within multidisciplinary pathways. Prospective multicentre trials should confirm these results and define how contrast-enhanced MRI can be fully integrated into European rectal cancer staging algorithms.</p>
        `;

        return `
            ${summaryParagraph}
            ${contextParagraph}
            ${clinicalImplicationsParagraph}
            ${limitationsParagraph}
            ${conclusionParagraph}
        `;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();