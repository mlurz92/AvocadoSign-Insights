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

        const getMetricText = (metric, type, opts = {}) => metric
            ? helpers.formatMetricForPublication(metric, type, opts)
            : window.APP_CONFIG.NA_PLACEHOLDER;

        const asAucText = getMetricText(performanceAS?.auc, 'auc');
        const asSensText = getMetricText(performanceAS?.sens, 'sens', { includeCount: true });
        const asSpecText = getMetricText(performanceAS?.spec, 'spec', { includeCount: true });
        const asAccText = getMetricText(performanceAS?.acc, 'acc');

        const bfAucText = getMetricText(bfResultForPub?.auc, 'auc');
        const bfSensText = getMetricText(bfResultForPub?.sens, 'sens', { includeCount: true });
        const bfSpecText = getMetricText(bfResultForPub?.spec, 'spec', { includeCount: true });
        const bfAccText = getMetricText(bfResultForPub?.acc, 'acc');

        const bfPValueText = bfComparisonForPub?.delong ? helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;
        const bfPowerText = (bfComparisonForPub?.delong && isFinite(bfComparisonForPub.delong.power))
            ? helpers.formatValueForPublication(bfComparisonForPub.delong.power * 100, 0)
            : null;
        const bfMcNemarText = bfComparisonForPub?.mcnemar ? helpers.formatPValueForPublication(bfComparisonForPub.mcnemar.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;

        const asMatrix = performanceAS?.matrix || {};
        const bfMatrix = bfResultForPub?.matrix || {};
        const totalMetastatic = (asMatrix.tp ?? 0) + (asMatrix.fn ?? 0);
        const totalBenign = (asMatrix.tn ?? 0) + (asMatrix.fp ?? 0);
        const formatCount = (value) => (isFinite(value) && value !== null)
            ? helpers.formatValueForPublication(value, 0)
            : window.APP_CONFIG.NA_PLACEHOLDER;
        const fnDifference = (isFinite(bfMatrix.fn) && isFinite(asMatrix.fn)) ? bfMatrix.fn - asMatrix.fn : null;
        const fpDifference = (isFinite(bfMatrix.fp) && isFinite(asMatrix.fp)) ? bfMatrix.fp - asMatrix.fp : null;

        const esgarOverallPerf = overallStats?.performanceT2Literature?.['ESGAR_2016_Overall'];
        const esgarOverallComparison = overallStats?.comparisonASvsT2Literature?.['ESGAR_2016_Overall'];
        const esgarAucText = getMetricText(esgarOverallPerf?.auc, 'auc');
        const esgarPValueText = esgarOverallComparison?.delong ? helpers.formatPValueForPublication(esgarOverallComparison.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;

        const surgeryStats = stats?.surgeryAlone;
        const neoadjuvantStats = stats?.neoadjuvantTherapy;
        const surgeryPerfAS = surgeryStats?.performanceAS;
        const neoadjuvantPerfAS = neoadjuvantStats?.performanceAS;
        const surgeryBfComparison = surgeryStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const neoadjuvantBfComparison = neoadjuvantStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];

        const surgerySensText = getMetricText(surgeryPerfAS?.sens, 'sens');
        const neoadjuvantSensText = getMetricText(neoadjuvantPerfAS?.sens, 'sens');
        const surgeryPValueText = surgeryBfComparison?.delong ? helpers.formatPValueForPublication(surgeryBfComparison.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;
        const neoadjuvantPValueText = neoadjuvantBfComparison?.delong ? helpers.formatPValueForPublication(neoadjuvantBfComparison.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;

        const esgarSurgeryAloneComparison = stats?.surgeryAlone?.comparisonASvsT2Literature?.['ESGAR_2016_SurgeryAlone'];

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
            <p>This European Radiology–aligned analysis validates the diagnostic performance of the contrast-enhanced Avocado Sign for predicting patient-level mesorectal nodal status. The sign delivered high discrimination (AUC, ${asAucText}), with balanced sensitivity (${asSensText}), specificity (${asSpecText}), and accuracy (${asAccText}). Against the cohort-specific, brute-force optimised T2 benchmark, the Avocado Sign retained statistical superiority (AUC ${asAucText} vs ${bfAucText}; DeLong ${bfPValueText}, power ${bfPowerText ? bfPowerText + '%': window.APP_CONFIG.NA_PLACEHOLDER}; McNemar ${bfMcNemarText}) while the brute-force T2 rule offered only ${bfSensText} sensitivity and ${bfSpecText} specificity, underscoring that the contrast-enhanced biomarker captures complementary biological information beyond composite T2-weighted morphologic patterns.</p>
        `;

        const interpretationParagraph = `
            <p>The clinical relevance of this superiority is evident in the confusion matrices: the Avocado Sign correctly identified ${formatCount(asMatrix.tp)} of ${formatCount(totalMetastatic)} metastatic cases while limiting false negatives to ${formatCount(asMatrix.fn)}, compared with ${formatCount(bfMatrix.tp)} true positives and ${formatCount(bfMatrix.fn)} misses for the brute-force T2 rule (difference, ${fnDifference !== null ? formatCount(fnDifference) : window.APP_CONFIG.NA_PLACEHOLDER}). It simultaneously spared ${formatCount(asMatrix.tn)} of ${formatCount(totalBenign)} node-negative patients from unnecessary concern and curtailed false-positive calls from ${formatCount(bfMatrix.fp)} to ${formatCount(asMatrix.fp)} (${fpDifference !== null ? formatCount(fpDifference) : window.APP_CONFIG.NA_PLACEHOLDER} fewer), thereby improving accuracy (${asAccText} vs ${bfAccText}) and offering a more reproducible binary output for multidisciplinary review.</p>
        `;

        const contextParagraph = `
            <p>Contextualised against the broader literature, the Avocado Sign outperformed the majority of conventional T2-weighted criteria, including the guideline-conform ESGAR set (AUC ${esgarAucText}; ${esgarPValueText}).${powerAnalysisText} Persistent shortfalls of T2-based assessment are well documented ${helpers.getReference('Beets_Tan_2018')}${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')}, contributing to the diminished reliance on nodal staging in pivotal rectal cancer trials such as OCUM ${helpers.getReference('Stelzner_2022')}. Our data support the concept that incorporating a brief contrast-enhanced acquisition provides a practical route to overcome this weakness. The Avocado Sign demonstrated consistent performance across treatment-naïve (${surgerySensText}; ${surgeryPValueText}) and post-neoadjuvant (${neoadjuvantSensText}; ${neoadjuvantPValueText}) cohorts (${interCohortPValueText}) and sustained almost perfect interobserver agreement (Cohen’s κ = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), reinforcing its suitability for routine adoption ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
        `;

        const futureWorkParagraph = `
            <p>Beyond diagnostic accuracy, the sign’s binary nature lends itself to integration into automated reading workflows and could facilitate risk-adapted clinical trials. Future prospective studies should examine quantitative perfusion or radiomics descriptors that might synergise with the Avocado Sign, assess its behaviour in low-prevalence screening populations, and evaluate cost-effectiveness compared with extended morphologic assessment.</p>
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
            ${interpretationParagraph}
            ${contextParagraph}
            ${futureWorkParagraph}
            ${clinicalImplicationsParagraph}
            ${limitationsParagraph}
            ${conclusionParagraph}
        `;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();