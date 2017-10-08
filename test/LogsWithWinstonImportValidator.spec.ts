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
    let findOrCreateLogsWithWinstonImportStub: sinon.SinonStub;
    let logsWithWinstonImportValidator: any;

    const dummyContents = "qqq";

    const indent = InheritsCliDecoratorOptions.DEFAULT_INDENT;

    beforeEach((): void => {
        findOrCreateLogsWithWinstonImportStub = sinon.stub(
            LogsWithWinstonImportValidator.prototype as any,
            "findOrCreateLogsWithWinstonImport",
        );
        logsWithWinstonImportValidator = new LogsWithWinstonImportValidator(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should check the given contents", (): void => {
            findOrCreateLogsWithWinstonImportStub.should.have.been.calledOnce;
            findOrCreateLogsWithWinstonImportStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    describe("createLogsWithWinstonImport", (): void => {
        const predictedOutput = `\
import one;
import two;${EOL}\
import three;${EOL}\
${EOL}\
import {
${indent}ILogsWithWinston,${EOL}\
${indent}LogsWithWinston,${EOL}\
} from "@wizardsoftheweb/logs-with-winston";${EOL}\
${EOL}\
after imports;${EOL}`;
        it("should add LogsWithWinston import after last import", (): void => {
            const output = (logsWithWinstonImportValidator as any).createLogsWithWinstonImport(`\
import one;
import two;
import three;

after imports;
`);
            output.should.equal(predictedOutput);
        });
    });

    describe("findOrInsertImports", (): void => {
        it("should pass imports through when ILogsWithWinston and LogsWithWinston are found", (): void => {
            const imports = `${EOL}\
${indent}LogsWithWinston,${EOL}\
${indent}ILogsWithWinston,${EOL}\
`;
            const predictedOutput = `${EOL}${indent}ILogsWithWinston,${EOL}${indent}LogsWithWinston,${EOL}`;
            const output = (logsWithWinstonImportValidator as any).findOrInsertImports(imports);
            output.should.equal(predictedOutput);
        });

        it("should add ILogsWithWinston when not found", (): void => {
            const imports = `${EOL}${indent}transports,${EOL}${indent}LogsWithWinston,${EOL}`;
            const predictedOutput = `${EOL}\
${indent}ILogsWithWinston,${EOL}\
${indent}LogsWithWinston,${EOL}\
${indent}transports,${EOL}\
`;
            const output = (logsWithWinstonImportValidator as any).findOrInsertImports(imports);
            output.should.equal(predictedOutput);
        });

        it("should add LogsWithWinston when not found", (): void => {
            const imports = `${EOL}${indent}transports,${EOL}${indent}ILogsWithWinston,${EOL}`;
            const predictedOutput = `${EOL}\
${indent}ILogsWithWinston,${EOL}\
${indent}LogsWithWinston,${EOL}\
${indent}transports,${EOL}\
`;
            const output = (logsWithWinstonImportValidator as any).findOrInsertImports(imports);
            output.should.equal(predictedOutput);
        });
    });

//     describe("findOrCreateLogsWithWinstonImport", (): void => {
//         let createLogsWithWinstonImportStub: sinon.SinonStub;

//         beforeEach((): void => {
//             findOrCreateLogsWithWinstonImportStub.restore();
//             createLogsWithWinstonImportStub = sinon.stub(
//                 logsWithWinstonImportValidator as any,
//                 "createLogsWithWinstonImport",
//             );
//         });

//         it("should pass through contents with import already exists", (): void => {
//             const contents = "import { LogsWithWinston } from '@wizardsoftheweb/logs-with-winston';";
//             const output = (logsWithWinstonImportValidator as any).findOrCreateLogsWithWinstonImport(contents);
//             output.should.equal(contents);
//             createLogsWithWinstonImportStub.should.not.have.been.called;
//         });

//         it("should prepend import when not found", (): void => {
//             const contents = "import { NotLogs } from 'not-the-right-package';";
//             const output = (logsWithWinstonImportValidator as any).findOrCreateLogsWithWinstonImport(contents);
//             createLogsWithWinstonImportStub.should.have.been.calledOnce;
//             createLogsWithWinstonImportStub.should.have.been.calledWithExactly(contents);
//         });
//     });

//     describe("findOrCreateLogsWithWinstonImport", (): void => {
//         let findOrInsertLoggerInstanceImportStub: sinon.SinonStub;
//         let createLogsWithWinstonImportStub: sinon.SinonStub;

//         const defaultReplacedImports = "qqq";

//         beforeEach((): void => {
//             findOrCreateLogsWithWinstonImportStub.restore();
//             findOrInsertLoggerInstanceImportStub = sinon.stub(
//                 logsWithWinstonImportValidator as any,
//                 "findOrInsertLoggerInstanceImport",
//             );
//             findOrInsertLoggerInstanceImportStub.returns(`${EOL}${indent}Logger,${EOL}${indent}LoggerInstance,${EOL}`);
//             createLogsWithWinstonImportStub = sinon.stub(logsWithWinstonImportValidator as any, "createWinstonImport");
//         });

//         it("should create an import when one is not found", (): void => {
//             const contents = "file contents;";
//             (logsWithWinstonImportValidator as any).checkWinstonImport(contents);
//             findOrInsertLoggerInstanceImportStub.should.not.have.been.called;
//             createWinstonImportStub.should.have.been.calledOnce;
//             createWinstonImportStub.should.have.been.calledWithExactly(contents);
//         });

//         it("should do nothing when a glob import is found", (): void => {
//             const contents = `import * as winston from "winston";${EOL}file contents;`;
//             const output = (logsWithWinstonImportValidator as any).checkWinstonImport(contents);
//             findOrInsertLoggerInstanceImportStub.should.not.have.been.called;
//             createWinstonImportStub.should.not.have.been.called;
//             output.should.equal(contents);
//         });

//         it("should attempt to insert a LoggerInstance reference when specific imports are found", (): void => {
//             const imports = `${EOL}${indent}LoggerInstance,${EOL}${indent}Logger,${EOL}`;
//             const contents = `import {${imports}} from "winston";${EOL}file contents;`;
//             const predictedOutput =`\
// import {${EOL}\
// ${indent}Logger,${EOL}\
// ${indent}LoggerInstance,${EOL}\
// } from "winston";${EOL}\
// file contents;`;
//             const output = (logsWithWinstonImportValidator as any).checkWinstonImport(contents);
//             findOrInsertLoggerInstanceImportStub.should.have.been.calledOnce;
//             findOrInsertLoggerInstanceImportStub.should.have.been.calledWithExactly(imports);
//             createWinstonImportStub.should.not.have.been.called;
//             output.should.equal(predictedOutput);
//         });
//     });

    afterEach((): void => {
        findOrCreateLogsWithWinstonImportStub.restore();
    });
});
