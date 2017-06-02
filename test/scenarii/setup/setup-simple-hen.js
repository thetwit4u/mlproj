"use strict";

(function() {

    function test(runner, scenario, cmd, base) {
        return scenario.test(
            runner,
            base + '../environs/simple-hen/prod.json',
            cmd.SetupCommand,
            [
                scenario.dbProps('simple-hen-content'),
                scenario.forests([]),
                scenario.asProps('simple-hen'),
                scenario.createDb({
                    'database-name': 'simple-hen-content',
                    'fast-case-sensitive-searches': true,
                    'fast-diacritic-sensitive-searches': false,
                    'fast-element-character-searches': false,
                    'fast-element-phrase-searches': true,
                    'fast-element-trailing-wildcard-searches': true,
                    'fast-element-word-searches': false,
                    'fast-phrase-searches': false,
                    'fast-reverse-searches': true
                }),
                scenario.createForest({
                    'forest-name': 'simple-hen-content-001',
                    'database': 'simple-hen-content'
                }),
                scenario.createAs({
                    'server-name': 'simple-hen',
                    'content-database': 'simple-hen-content',
                    'server-type': 'http',
                    'port': 7080,
                    'output-byte-order-mark': 'no',
                    'output-cdata-section-localname': 'code-snippet',
                    'output-cdata-section-namespace-uri': 'http://example.org/ns',
                    'root': '/tmp/does/not/exist/'
                })
            ]);
    }

    module.exports = {
        test : test
    }
}
)();
