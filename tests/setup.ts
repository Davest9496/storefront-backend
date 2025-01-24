import Jasmine from 'jasmine';
import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';

const runner = new Jasmine({});
runner.loadConfigFile('tests/jasmine.json');

runner.clearReporters();
runner.addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.NONE,
    },
  })
);

runner.execute();
