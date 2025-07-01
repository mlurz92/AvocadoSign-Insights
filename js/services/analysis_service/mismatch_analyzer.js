window.mismatchAnalyzer = (() => {

    function analyze(evaluatedData) {
        const results = {
            concordantCorrect: [],
            concordantIncorrect: [],
            asSuperior: [],
            t2Superior: [],
            asSuperior_avoids_fp: [],
            asSuperior_avoids_fn: [],
            t2Superior_avoids_fp: [],
            t2Superior_avoids_fn: []
        };

        if (!Array.isArray(evaluatedData)) {
            return results;
        }

        evaluatedData.forEach(p => {
            if (!p || typeof p !== 'object' || !p.nStatus || !p.asStatus || !p.t2Status) {
                return;
            }

            const asCorrect = p.asStatus === p.nStatus;
            const t2Correct = p.t2Status === p.nStatus;
            const isNPositive = p.nStatus === '+';

            if (asCorrect && t2Correct) {
                results.concordantCorrect.push(p);
            } else if (!asCorrect && !t2Correct) {
                results.concordantIncorrect.push(p);
            } else if (asCorrect && !t2Correct) {
                results.asSuperior.push(p);
                if (isNPositive) {
                    results.asSuperior_avoids_fn.push(p);
                } else {
                    results.asSuperior_avoids_fp.push(p);
                }
            } else if (!asCorrect && t2Correct) {
                results.t2Superior.push(p);
                if (isNPositive) {
                    results.t2Superior_avoids_fn.push(p);
                } else {
                    results.t2Superior_avoids_fp.push(p);
                }
            }
        });
        return results;
    }

    return Object.freeze({
        analyze
    });

})();