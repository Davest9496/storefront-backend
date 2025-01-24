import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';
import app from '../src/server'; // Add this import

const jasmineInstance = new Jasmine();

// Configure Jasmine
jasmineInstance.loadConfigFile('tests/jasmine.json');
jasmineInstance.clearReporters();
jasmineInstance.addReporter(new SpecReporter());

// Makes app available to tests
(global as any).app = app;

jasmineInstance.execute();
