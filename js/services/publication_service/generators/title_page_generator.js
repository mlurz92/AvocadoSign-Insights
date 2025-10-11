window.generators.titlePageGenerator = (() => {

    function generateTitlePageHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const helpers = window.publicationHelpers;

        const title = window.APP_CONFIG.PUBLICATION_TITLE;
        const authors = "Markus Lurz, MD • Arnd-Oliver Schäfer, MD";
        const institution = "Department of Radiology and Nuclear Medicine, St. Georg Hospital, Leipzig, Germany";
        const correspondingAuthor = {
            name: "Markus Lurz, MD",
            address: "Delitzscher Str. 141, 04129 Leipzig, Germany",
            email: "Markus.Lurz@sanktgeorg.de"
        };

        const manuscriptType = "Original Article";
        const fundingStatement = "The authors state that this work has not received any funding.";
        const dataSharingStatement = "De-identified data generated or analysed during the current study are available from the corresponding author on reasonable request.";
        const conflictStatement = "The authors declare no conflicts of interest.";
        const guarantorStatement = "Guarantor of the article: Markus Lurz.";

        let summaryStatementHTML = '<p>Summary statement could not be generated due to missing data.</p>';
        let keyPointsHTML = '';
        let studyHighlightsHTML = '<p>Study highlights could not be generated due to missing data.</p>';
        let clinicalRelevanceHTML = '';

        if (overallStats && commonData) {
            const { nOverall, bruteForceMetricForPublication } = commonData;
            const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
            const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];

            const asOverallAUC = overallStats?.performanceAS?.auc;
            const esgarHybridAUC = overallStats?.performanceT2Literature?.['ESGAR_2016_Overall']?.auc;
            const esgarHybridComparisonPValue = overallStats?.comparisonASvsT2Literature?.['ESGAR_2016_Overall']?.delong?.pValue;

            const bfT2OverallAUC = bfResultForPub?.auc;
            const bfComparisonPValue = bfComparisonForPub?.delong?.pValue;

            const overallSens = overallStats?.performanceAS?.sens;
            const overallSpec = overallStats?.performanceAS?.spec;

            summaryStatementHTML = `<p><strong>In this single-centre cohort of ${nOverall} patients with rectal cancer, the contrast-enhanced Avocado Sign outperformed both literature-derived and computationally optimised T2-weighted criteria for predicting patient-level mesorectal nodal status.</strong></p>`;

            keyPointsHTML = `
                <h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 1.5rem;">Key Points</h4>
                <ul style="padding-left: 20px; margin-top: 0.5rem; list-style-position: inside; text-align: left;">
                    <li>The contrast-enhanced Avocado Sign achieved an AUC of ${helpers.formatMetricForPublication(asOverallAUC, 'auc')} for mesorectal nodal staging.</li>
                    <li>Exhaustively optimised T2-weighted combinations remained inferior (AUC, ${helpers.formatValueForPublication(bfT2OverallAUC?.value, 2, false, true)}; ${helpers.formatPValueForPublication(bfComparisonPValue)}).</li>
                    <li>A single binary imaging marker may streamline multidisciplinary decisions about neoadjuvant therapy.</li>
                </ul>
            `;

            studyHighlightsHTML = `
                <h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 1.5rem;">Study Highlights</h4>
                <ul style="padding-left: 20px; margin-top: 0.5rem; list-style-position: inside; text-align: left;">
                    <li>Sensitivity and specificity of the Avocado Sign were ${helpers.formatMetricForPublication(overallSens, 'sens', { includeCI: false, includeCount: true })} and ${helpers.formatMetricForPublication(overallSpec, 'spec', { includeCI: false, includeCount: true })}, respectively.</li>
                    <li>The Avocado Sign provided a higher diagnostic yield than the ESGAR consensus criteria (AUC, ${helpers.formatValueForPublication(asOverallAUC?.value, 2, false, true)} vs ${helpers.formatValueForPublication(esgarHybridAUC?.value, 2, false, true)}; ${helpers.formatPValueForPublication(esgarHybridComparisonPValue)}).</li>
                    <li>The brute-force combination of T2 features could not match the Avocado Sign despite exhaustive tuning (${helpers.formatPValueForPublication(bfComparisonPValue)}).</li>
                </ul>
            `;

            clinicalRelevanceHTML = `<p style="margin-top: 1rem;"><strong>Clinical relevance statement:</strong> Implementing a contrast-enhanced read dedicated to the Avocado Sign could provide a reproducible, binary adjunct to existing rectal MRI reporting templates and increase confidence when triaging patients for neoadjuvant treatment pathways.</p>`;
        }

        return `
            <div id="title_main" class="publication-title-page" style="padding: 2rem; border-bottom: 2px solid #333; margin-bottom: 2rem;">
                <p style="font-size: 1rem; color: #555;"><strong>Article Type:</strong> ${manuscriptType}</p>
                <h1 style="font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem; color: #000;">${title}</h1>
                <div style="font-size: 1rem; color: #333; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 0.25rem;"><strong>Authors:</strong> ${authors}</p>
                    <p style="margin-bottom: 0;"><strong>From the:</strong> ${institution}</p>
                </div>

                ${summaryStatementHTML}
                ${keyPointsHTML}
                ${studyHighlightsHTML}
                ${clinicalRelevanceHTML}

                <div style="font-size: 0.85rem; color: #444; margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 1rem;">
                    <p><strong>Address correspondence to:</strong> ${correspondingAuthor.name}, ${institution}, ${correspondingAuthor.address} (e-mail: ${correspondingAuthor.email}).</p>
                    <p><strong>Guarantor:</strong> ${guarantorStatement}</p>
                    <p><strong>Conflict of interest:</strong> ${conflictStatement}</p>
                    <p><strong>Funding:</strong> ${fundingStatement}</p>
                    <p><strong>Data availability:</strong> ${dataSharingStatement}</p>
                </div>
            </div>
        `;
    }

    return Object.freeze({
        generateTitlePageHTML
    });

})();