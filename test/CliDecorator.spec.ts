/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { InheritsCliDecoratorOptions } from "../src/lib/InheritsCliDecoratorOptions";

const should = chai.should();
chai.use(sinonChai);

const contents = "qqq";

const writeFileSync = sinon.stub();
const ClassLoader = sinon.stub()
    .callsFake((input: string) => {
        return { contents: input };
    });
const DecoratorImplementor = sinon.stub()
    .callsFake((input: string) => {
        return { contents: input };
    });
const files = ["one", "two"];
const FileResolver = sinon.stub()
    .returns({ files });
const LogsWithWinstonImportValidator = sinon.stub()
    .callsFake((input: string) => {
        return { contents: input };
    });
const WinstonImportValidator = sinon.stub()
    .callsFake((input: string) => {
        return { contents: input };
    });
const CliDecorator = proxyquire("../src/lib/CliDecorator", {
    /* tslint:disable:object-literal-key-quotes */
    "./ClassLoader": {
        "@noCallThru": true,
        ClassLoader,
    },
    "./DecoratorImplementor": {
        "@noCallThru": true,
        DecoratorImplementor,
    },
    "./FileResolver": {
        "@noCallThru": true,
        FileResolver,
    },
    "./LogsWithWinstonImportValidator": {
        "@noCallThru": true,
        LogsWithWinstonImportValidator,
    },
    "./WinstonImportValidator": {
        "@noCallThru": true,
        WinstonImportValidator,
    },
    "fs": {
        "@noCallThru": true,
        writeFileSync,
    },
    /* tslint:enable:object-literal-key-quotes */
}).CliDecorator;

describe("CliDecorator", (): void => {
    let cliDecorator: any;

    beforeEach((): void => {
        resetFs();
    });

    describe("constructor", (): void => {
        it("should assign files", (): void => {
            cliDecorator = new CliDecorator();
            (cliDecorator as any).files.should.deep.equal(files);
        });
    });

    describe("decorate", (): void => {
        it("should decorate all files", (): void => {
            cliDecorator = new CliDecorator({} as any);
            const options = (cliDecorator as any).options;
            cliDecorator.decorate();
            ClassLoader.should.have.callCount(files.length);
            WinstonImportValidator.should.have.callCount(files.length);
            LogsWithWinstonImportValidator.should.have.callCount(files.length);
            DecoratorImplementor.should.have.callCount(files.length);
            writeFileSync.should.have.callCount(files.length);
            const iterations = new Array(files.length).fill(0).map((current: number, index: number) => {
                return index;
            });
            for (const iteration of iterations) {
                const classLoaderCall = ClassLoader.getCall(iteration);
                classLoaderCall.should.have.been.calledWithNew;
                classLoaderCall.should.have.been.calledWithExactly(files[iteration], options);
                const winstonImportValidatorCall = WinstonImportValidator.getCall(iteration);
                winstonImportValidatorCall.should.have.been.calledWithNew;
                winstonImportValidatorCall.should.have.been.calledWithExactly(files[iteration], options);
                const logsWithWinstonImportValidatorCall = LogsWithWinstonImportValidator.getCall(iteration);
                logsWithWinstonImportValidatorCall.should.have.been.calledWithNew;
                logsWithWinstonImportValidatorCall.should.have.been.calledWithExactly(files[iteration], options);
                const decoratorImplementorCall = DecoratorImplementor.getCall(iteration);
                decoratorImplementorCall.should.have.been.calledWithNew;
                decoratorImplementorCall.should.have.been.calledWithExactly(files[iteration], options);
                const writeFileSyncCall = writeFileSync.getCall(iteration);
                writeFileSyncCall.should.have.been.calledWithExactly(files[iteration], files[iteration], "utf-8");
            }
        });
    });

    function resetFs(): void {
        writeFileSync.reset();
    }
});
