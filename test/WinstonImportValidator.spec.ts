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

const basename = sinon.stub();
const readFileSync = sinon.stub();
const writeFileSync = sinon.stub();
const WinstonImportValidator = proxyquire("../src/lib/WinstonImportValidator", {}).WinstonImportValidator;

describe("WinstonImportValidator", (): void => {
    let findOrCreateWinstonImportStub: sinon.SinonStub;
    let winstonImportValidator: any;

    const dummyContents = "qqq";

    const indent = InheritsCliDecoratorOptions.DEFAULT_INDENT;

    beforeEach((): void => {
        findOrCreateWinstonImportStub = sinon.stub(WinstonImportValidator.prototype as any, "findOrCreateWinstonImport");
        winstonImportValidator = new WinstonImportValidator(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should check the given contents", (): void => {
            findOrCreateWinstonImportStub.should.have.been.calledOnce;
            findOrCreateWinstonImportStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    describe("createWinstonImport", (): void => {
        it("should prepend the import", (): void => {
            const contents = "contents of file;";
            const predictedOutput = `\
import { LoggerInstance } from "winston";${EOL}\
${EOL}\
contents of file;`;
            const output = (winstonImportValidator as any).createWinstonImport(contents);
            output.should.equal(predictedOutput);
        });
    });

    describe("findOrInsertLoggerInstanceImport", (): void => {
        it("should pass imports through when LoggerInstance is found", (): void => {
            const imports = `${EOL}\
${indent}LoggerInstance,${EOL}\
${indent}Logger,${EOL}\
`;
            const predictedOutput = `${EOL}${indent}Logger,${EOL}${indent}LoggerInstance,${EOL}`;
            const output = (winstonImportValidator as any).findOrInsertLoggerInstanceImport(imports);
            output.should.equal(predictedOutput);
        });

        it("should add LoggerInstance when not found", (): void => {
            const imports = `${EOL}${indent}transports,${EOL}${indent}Logger,${EOL}`;
            const predictedOutput = `${EOL}\
${indent}Logger,${EOL}\
${indent}LoggerInstance,${EOL}\
${indent}transports,${EOL}\
`;
            const output = (winstonImportValidator as any).findOrInsertLoggerInstanceImport(imports);
            output.should.equal(predictedOutput);
        });
    });

    describe("findOrCreateWinstonImport", (): void => {
        let findOrInsertLoggerInstanceImportStub: sinon.SinonStub;
        let createWinstonImportStub: sinon.SinonStub;

        const defaultReplacedImports = "qqq";

        beforeEach((): void => {
            findOrCreateWinstonImportStub.restore();
            findOrInsertLoggerInstanceImportStub = sinon.stub(
                winstonImportValidator as any,
                "findOrInsertLoggerInstanceImport",
            );
            findOrInsertLoggerInstanceImportStub.returns(`${EOL}${indent}Logger,${EOL}${indent}LoggerInstance,${EOL}`);
            createWinstonImportStub = sinon.stub(winstonImportValidator as any, "createWinstonImport");
        });

        it("should create an import when one is not found", (): void => {
            const contents = "file contents;";
            (winstonImportValidator as any).findOrCreateWinstonImport(contents);
            findOrInsertLoggerInstanceImportStub.should.not.have.been.called;
            createWinstonImportStub.should.have.been.calledOnce;
            createWinstonImportStub.should.have.been.calledWithExactly(contents);
        });

        it("should do nothing when a glob import is found", (): void => {
            const contents = `import * as winston from "winston";${EOL}file contents;`;
            const output = (winstonImportValidator as any).findOrCreateWinstonImport(contents);
            findOrInsertLoggerInstanceImportStub.should.not.have.been.called;
            createWinstonImportStub.should.not.have.been.called;
            output.should.equal(contents);
        });

        it("should attempt to insert a LoggerInstance reference when specific imports are found", (): void => {
            const imports = `${EOL}${indent}LoggerInstance,${EOL}${indent}Logger,${EOL}`;
            const contents = `import {${imports}} from "winston";${EOL}file contents;`;
            const predictedOutput =`\
import {${EOL}\
${indent}Logger,${EOL}\
${indent}LoggerInstance,${EOL}\
} from "winston";${EOL}\
file contents;`;
            const output = (winstonImportValidator as any).findOrCreateWinstonImport(contents);
            findOrInsertLoggerInstanceImportStub.should.have.been.calledOnce;
            findOrInsertLoggerInstanceImportStub.should.have.been.calledWithExactly(imports);
            createWinstonImportStub.should.not.have.been.called;
            output.should.equal(predictedOutput);
        });
    });

    afterEach((): void => {
        findOrCreateWinstonImportStub.restore();
    });
});
