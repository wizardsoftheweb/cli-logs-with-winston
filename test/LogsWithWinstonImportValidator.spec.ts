/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import { EOL } from "os";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { InheritsCliDecoratorOptions } from "../src/lib/InheritsCliDecoratorOptions";

const should = chai.should();
chai.use(sinonChai);

const LogsWithWinstonImportValidator = proxyquire(
    "../src/lib/LogsWithWinstonImportValidator",
    {},
).LogsWithWinstonImportValidator;

describe("", (): void => {
    let findOrImportLogsWithWinstonStub: sinon.SinonStub;
    let logsWithWinstonImportValidator: any;

    const dummyContents = "qqq";

    const indent = InheritsCliDecoratorOptions.DEFAULT_INDENT;

    beforeEach((): void => {
        findOrImportLogsWithWinstonStub = sinon.stub(
            LogsWithWinstonImportValidator.prototype as any,
            "findOrImportLogsWithWinston",
        );
        logsWithWinstonImportValidator = new LogsWithWinstonImportValidator(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should check the given contents", (): void => {
            findOrImportLogsWithWinstonStub.should.have.been.calledOnce;
            findOrImportLogsWithWinstonStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    describe("prependLogsWithWinstonImport", (): void => {
        const predictedOutput = `\
import one;
import two;${EOL}\
import three;${EOL}\
${EOL}\
import { LogsWithWinston } from "@wizardsoftheweb/logs-with-winston";${EOL}\
${EOL}\
after imports;${EOL}`;
        it("should add LogsWithWinston import after last import", (): void => {
            const output = (logsWithWinstonImportValidator as any).prependLogsWithWinstonImport(`\
import one;
import two;
import three;

after imports;
`);
            output.should.equal(predictedOutput);
        });
    });

    describe("findOrImportLogsWithWinston", (): void => {
        let prependLogsWithWinstonImportStub: sinon.SinonStub;

        beforeEach((): void => {
            findOrImportLogsWithWinstonStub.restore();
            prependLogsWithWinstonImportStub = sinon.stub(
                logsWithWinstonImportValidator as any,
                "prependLogsWithWinstonImport",
            );
        });

        it("should pass through contents with import already exists", (): void => {
            const contents = "import { LogsWithWinston } from '@wizardsoftheweb/logs-with-winston';";
            const output = (logsWithWinstonImportValidator as any).findOrImportLogsWithWinston(contents);
            output.should.equal(contents);
            prependLogsWithWinstonImportStub.should.not.have.been.called;
        });

        it("should prepend import when not found", (): void => {
            const contents = "import { NotLogs } from 'not-the-right-package';";
            const output = (logsWithWinstonImportValidator as any).findOrImportLogsWithWinston(contents);
            prependLogsWithWinstonImportStub.should.have.been.calledOnce;
            prependLogsWithWinstonImportStub.should.have.been.calledWithExactly(contents);
        });
    });

    afterEach((): void => {
        findOrImportLogsWithWinstonStub.restore();
    })
});
