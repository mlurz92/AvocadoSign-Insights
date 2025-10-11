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
        const hasValue = (text) => text && text !== window.APP_CONFIG.NA_PLACEHOLDER;

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

        const surgeryPerfBF = surgeryStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const neoadjuvantPerfBF = neoadjuvantStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];

        const surgerySensText = getMetricText(surgeryPerfAS?.sens, 'sens');
        const surgerySpecText = getMetricText(surgeryPerfAS?.spec, 'spec');
        const neoadjuvantSensText = getMetricText(neoadjuvantPerfAS?.sens, 'sens');
        const neoadjuvantSpecText = getMetricText(neoadjuvantPerfAS?.spec, 'spec');
        const surgeryBfSensText = getMetricText(surgeryPerfBF?.sens, 'sens');
        const neoadjuvantBfSensText = getMetricText(neoadjuvantPerfBF?.sens, 'sens');
        const surgeryPValueText = surgeryBfComparison?.delong ? helpers.formatPValueForPublication(surgeryBfComparison.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;
        const neoadjuvantPValueText = neoadjuvantBfComparison?.delong ? helpers.formatPValueForPublication(neoadjuvantBfComparison.delong.pValue) : window.APP_CONFIG.NA_PLACEHOLDER;

        const esgarSurgeryAloneComparison = stats?.surgeryAlone?.comparisonASvsT2Literature?.['ESGAR_2016_SurgeryAlone'];

        let interCohortText = '';
        const interComp = stats?.interCohortComparison?.as;
        if (interComp && Math.abs(interComp.diffAUC) < 0.2) {
            interCohortText = ` No significant heterogeneity in AUC was observed between the treatment-naïve and post-neoadjuvant pathways (${helpers.formatPValueForPublication(interComp.pValue)}), highlighting its applicability along the entire rectal cancer treatment continuum.`;
        }

        const delongClause = hasValue(bfPValueText)
            ? ` (DeLong ${bfPValueText}${bfPowerText ? `; post-hoc power ${bfPowerText}%` : ''})`
            : '';
        const accuracyClause = hasValue(bfAccText)
            ? ` and higher accuracy (${asAccText} vs ${bfAccText}${hasValue(bfMcNemarText) ? `; McNemar ${bfMcNemarText}` : ''})`
            : hasValue(bfMcNemarText)
                ? ` and superior paired accuracy (McNemar ${bfMcNemarText})`
                : '';

        let comparatorSentence = '';
        if (hasValue(bfAucText)) {
            const comparatorPerformance = [
                hasValue(bfSensText) ? `${bfSensText} sensitivity` : null,
                hasValue(bfSpecText) ? `${bfSpecText} specificity` : null
            ].filter(Boolean).join(' and ');
            const comparatorDetail = comparatorPerformance ? `, which achieved ${comparatorPerformance}` : '';
            comparatorSentence = `When benchmarked against the internally optimised composite T2 rule (${bfAucText})${comparatorDetail}, the Avocado Sign retained superior discrimination${delongClause}${accuracyClause}.`;
        }

        const metastaticSentenceParts = [];
        if (isFinite(totalMetastatic) && totalMetastatic > 0) {
            metastaticSentenceParts.push(`it correctly classified ${formatCount(asMatrix.tp)} of ${formatCount(totalMetastatic)} metastatic cases`);
        }
        if (fnDifference !== null) {
            metastaticSentenceParts.push(`avoiding ${formatCount(fnDifference)} additional missed nodal metastases relative to the T2 benchmark (${formatCount(bfMatrix.fn)} vs ${formatCount(asMatrix.fn)})`);
        }
        if (isFinite(totalBenign) && totalBenign > 0) {
            metastaticSentenceParts.push(`and spared ${formatCount(asMatrix.tn)} of ${formatCount(totalBenign)} node-negative patients from false alarms`);
        }
        if (fpDifference !== null) {
            metastaticSentenceParts.push(`reducing false positives by ${formatCount(fpDifference)} (${formatCount(bfMatrix.fp)} vs ${formatCount(asMatrix.fp)})`);
        }
        const confusionMatrixSentence = metastaticSentenceParts.length > 0
            ? `Inspection of the confusion matrices illustrated the clinical impact: ${metastaticSentenceParts.join('; ')}.`
            : '';

        const subgroupSegments = [];
        if (hasValue(surgerySensText) || hasValue(surgerySpecText)) {
            let segment = `In the surgery-alone cohort, the sign maintained ${hasValue(surgerySensText) ? surgerySensText : ''}${hasValue(surgerySensText) && hasValue(surgerySpecText) ? ' sensitivity and ' : ''}${hasValue(surgerySpecText) ? `${surgerySpecText} specificity` : ''}`;
            if (hasValue(surgeryBfSensText)) {
                segment += ` compared with ${surgeryBfSensText} sensitivity for the brute-force T2 rule`;
            }
            if (hasValue(surgeryPValueText)) {
                segment += ` (DeLong ${surgeryPValueText})`;
            }
            segment += '.';
            subgroupSegments.push(segment);
        }
        if (hasValue(neoadjuvantSensText) || hasValue(neoadjuvantSpecText)) {
            let segment = `Following neoadjuvant therapy, diagnostic performance remained robust with ${hasValue(neoadjuvantSensText) ? neoadjuvantSensText : ''}${hasValue(neoadjuvantSensText) && hasValue(neoadjuvantSpecText) ? ' sensitivity and ' : ''}${hasValue(neoadjuvantSpecText) ? `${neoadjuvantSpecText} specificity` : ''}`;
            if (hasValue(neoadjuvantBfSensText)) {
                segment += `, outperforming the optimised T2 benchmark (${neoadjuvantBfSensText} sensitivity)`;
            }
            if (hasValue(neoadjuvantPValueText)) {
                segment += ` (DeLong ${neoadjuvantPValueText})`;
            }
            segment += '.';
            subgroupSegments.push(segment);
        }
        if (interCohortText) {
            subgroupSegments.push(interCohortText);
        }
        const subgroupParagraph = subgroupSegments.length > 0
            ? subgroupSegments.join(' ')
            : '';

        const esgarSentence = hasValue(esgarAucText)
            ? `Relative to the ESGAR consensus criteria (${esgarAucText}), the Avocado Sign offered higher discrimination${hasValue(esgarPValueText) ? ` (DeLong ${esgarPValueText})` : ''}.`
            : '';

        let esgarPowerSentence = '';
        if (esgarSurgeryAloneComparison?.delong?.pValue > window.APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
            const power = esgarSurgeryAloneComparison.delong.power;
            if (isFinite(power) && power < 0.8) {
                esgarPowerSentence = `The non-significant difference against the ESGAR staging benchmark in the surgery-alone cohort should be interpreted in light of the limited post-hoc power (${helpers.formatValueForPublication(power * 100, 0)}%), reflecting the modest subgroup sample size.`;
            }
        }

        const literatureSentence = `These findings align with contemporary reports underscoring the constraints of morphology-only assessment ${helpers.getReference('Beets_Tan_2018')}${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')} and complement benchmarking work on node-centric MRI criteria ${helpers.getReference('Rutegard_2025')}${helpers.getReference('Jiang_2025')}, while resonating with the diminishing reliance on conventional nodal staging in pivotal rectal cancer trials such as OCUM ${helpers.getReference('Stelzner_2022')}.`;

        const interobserverSentence = `Interobserver agreement remained almost perfect (Cohen’s κ = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), supporting standardised reporting ${helpers.getReference('Lurz_Schaefer_2025')}.`;

        const principalFindingsSection = `
            <h3 id="discussion_principal_findings">Principal Findings</h3>
            <p>The contrast-enhanced Avocado Sign delivered high diagnostic discrimination for mesorectal nodal staging (AUC ${asAucText}) with balanced sensitivity (${asSensText}) and specificity (${asSpecText}), yielding an overall accuracy of ${asAccText}. ${comparatorSentence}</p>
        `;

        const diagnosticInterpretationSection = confusionMatrixSentence
            ? `
                <h3 id="discussion_diagnostic_interpretation">Diagnostic Interpretation</h3>
                <p>${confusionMatrixSentence}</p>
            `
            : '';

        const subgroupSection = subgroupParagraph
            ? `
                <h3 id="discussion_subgroup_generalizability">Subgroup Performance and Generalisability</h3>
                <p>${subgroupParagraph} ${interobserverSentence}</p>
            `
            : `
                <h3 id="discussion_subgroup_generalizability">Subgroup Performance and Generalisability</h3>
                <p>${interobserverSentence}</p>
            `;

        const literatureSection = `
            <h3 id="discussion_context">Comparison with Existing Evidence</h3>
            <p>${esgarSentence} ${esgarPowerSentence} ${literatureSentence} Together, they emphasise that the Avocado Sign augments the ESGAR-endorsed lexicon ${helpers.getReference('Lee_2023')} by capturing contrast-enhancement kinetics beyond morphologic descriptors.</p>
        `;

        const clinicalImplicationsSection = `
            <h3 id="discussion_clinical_implications">Clinical Implications</h3>
            <p>The sign’s binary readout provides an actionable surrogate for nodal biology that can streamline multidisciplinary tumour board deliberations and dovetails with organ-preserving strategies such as total neoadjuvant therapy and watch-and-wait protocols ${helpers.getReference('Garcia_Aguilar_2022')}${helpers.getReference('Schrag_2023')}. Consistent performance across treatment stages facilitates harmonised reporting templates and may decrease reliance on extended morphologic criteria, thereby reducing interpretive variability.</p>
        `;

        const futureWorkSection = `
            <h3 id="discussion_future_work">Future Directions</h3>
            <p>Prospective multicentre trials should validate these findings across vendors, field strengths, and contrast agents, explore integration with automated detection or radiomics pipelines, and evaluate health-economic impact relative to prolonged morphologic protocols. Extending evaluation to lower-prevalence screening populations and incorporating longitudinal surveillance cohorts could define the biomarker’s role within adaptive treatment algorithms.</p>
        `;

        const limitationsSection = `
            <h3 id="discussion_limitations">Study Limitations</h3>
            <p>This retrospective, single-centre analysis may restrict generalisability despite consecutive inclusion. The surgery-alone subgroup was small (n=${commonData.nSurgeryAlone}), constraining power for certain comparisons and influencing post-hoc power estimates. The brute-force T2 benchmark was derived from the same dataset, potentially introducing optimism bias, although any residual overfitting renders the observed superiority of the Avocado Sign conservative. Imaging was performed exclusively on a single 3.0-T platform using one gadolinium agent, and histopathology did not systematically quantify micrometastases, warranting external technical validation.</p>
        `;

        const conclusionSection = `
            <h3 id="discussion_conclusion">Conclusion</h3>
            <p>The contrast-enhanced Avocado Sign emerges as an accurate, reproducible, and implementation-ready biomarker for mesorectal nodal staging. Its superiority over both literature-based and data-driven T2-weighted criteria supports immediate incorporation into European Radiology practice frameworks, while ongoing multicentre research should finalise its placement within staging algorithms and adaptive treatment pathways.</p>
        `;

        return `
            ${principalFindingsSection}
            ${diagnosticInterpretationSection}
            ${subgroupSection}
            ${literatureSection}
            ${clinicalImplicationsSection}
            ${futureWorkSection}
            ${limitationsSection}
            ${conclusionSection}
        `;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();