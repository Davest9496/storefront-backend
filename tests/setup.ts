import Jasmine = require('jasmine');
import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';

const jasmine = new Jasmine();
jasmine.loadConfigFile('tests/jasmine.json');

jasmine.clearReporters();
jasmine.addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.NONE,
    },
  })
);

jasmine.execute();
