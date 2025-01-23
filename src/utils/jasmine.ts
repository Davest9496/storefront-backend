import Jasmine from 'jasmine';
import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';

const jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');

jasmine.clearReporters();
jasmine.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
      displayStacktrace: 'pretty' as StacktraceOption,
    },
  })
);

jasmine.execute();
