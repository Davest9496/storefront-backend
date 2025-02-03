import { DisplayProcessor, SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';

class CustomProcessor extends DisplayProcessor {
  public displayJasmineStarted(): string {
    return 'Testing Started\n';
  }
}

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.RAW,
      displayDuration: true,
    },
    customProcessors: [CustomProcessor],
  })
);
