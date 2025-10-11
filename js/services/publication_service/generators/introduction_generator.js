window.generators.introductionGenerator = (() => {

    function generateIntroductionHTML(stats, commonData) {
        const helpers = window.publicationHelpers;

        const introText = `
            <p>Accurate preoperative determination of the mesorectal lymph-node (N) status remains pivotal for contemporary rectal cancer management. It informs the selection of primary surgery versus neoadjuvant therapy and enables patient triage for organ-preserving pathways, including total neoadjuvant therapy and watch-and-wait strategies ${helpers.getReference('Schrag_2023')}${helpers.getReference('Garcia_Aguilar_2022')}. Magnetic resonance imaging (MRI) is firmly established as the cornerstone for local staging, yet its capacity to stratify nodal disease continues to be regarded as the modality’s “weakest link” ${helpers.getReference('Beets_Tan_2018')}.</p>
            <p>This vulnerability stems from the dependence on T2-weighted (T2w) morphologic criteria. Although ESGAR and other expert bodies recommend composite assessment of nodal size, border, and signal intensity, diagnostic accuracy remains modest ${helpers.getReference('Beets_Tan_2018')}. The latest ACR Appropriateness Criteria acknowledge that sensitivity for nodal metastases is “mediocre” and highlight the potential contribution of intravenous contrast ${helpers.getReference('Lee_2023')}. Meta-analytic data report pooled sensitivity and specificity of only 77% and 71% for T2w-based MRI ${helpers.getReference('Al_Sukhni_2012')}, while the prospective OCUM trial observed an accuracy of 56.5% for MRI-based N-staging ${helpers.getReference('Stelzner_2022')}. Such performance deficits risk both overtreatment and undertreatment, underscoring the need for a robust, reproducible imaging biomarker.</p>
            <p>The contrast-enhanced “Avocado Sign” (AS)—a hypointense core within an otherwise homogeneously enhancing mesorectal lymph node—was recently introduced as a binary imaging marker with promising accuracy ${helpers.getReference('Lurz_Schaefer_2025')}. To justify its incorporation into standardised reporting pathways, the sign must demonstrate superiority not only over consensus guideline criteria but also over the best diagnostic yield that can be achieved by optimising T2w morphologic combinations within the same dataset.</p>
            <p>The objective of this European Radiology–oriented study was therefore two-fold: (1) to benchmark the Avocado Sign against an exhaustive, data-driven optimisation of T2w features tailored to the study cohort, and (2) to contextualise its performance against validated literature criteria applied to appropriate clinical subgroups. This design aligns with STARD guidance and provides a stringent test of the sign’s clinical utility.</p>
        `;

        return introText;
    }

    return Object.freeze({
        generateIntroductionHTML
    });

})();