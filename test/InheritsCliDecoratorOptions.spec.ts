/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { EOL } from "os";

const should = chai.should();
chai.use(sinonChai);

import { ICliDecoratorOptions } from "../src/lib/interfaces";

const Logger = sinon.stub();
const silly = sinon.stub();
const loggerStub = { silly };
const InheritsCliDecoratorOptions = proxyquire("../src/lib/InheritsCliDecoratorOptions", {
    /* tslint:disable:object-literal-key-quotes */
    "winston": {
        "@noCallThru": true,
        Logger,
    },
    /* tslint:enable:object-literal-key-quotes */
}).InheritsCliDecoratorOptions;

describe("InheritsCliDecoratorOptions", (): void => {
    let inheritsCliDecoratorOptionsInstance: any;

    beforeEach((): void => {
        resetWinston();
        inheritsCliDecoratorOptionsInstance = new InheritsCliDecoratorOptions({} as any);
    });

    describe("constructor", (): void => {
        it("should log options only once", (): void => {
            InheritsCliDecoratorOptions.notLogged.should.be.false;
            inheritsCliDecoratorOptionsInstance = new InheritsCliDecoratorOptions({} as any);
            InheritsCliDecoratorOptions.notLogged.should.be.false;
        });

        it("should assign defaults without input", (): void => {
            const options: ICliDecoratorOptions = (inheritsCliDecoratorOptionsInstance as any).options as any;
            options.decorator.should.deep.equal(InheritsCliDecoratorOptions.DEFAULT_DECORATOR);
            options.eol.should.deep.equal(InheritsCliDecoratorOptions.DEFAULT_EOL);
            options.extension.should.deep.equal(InheritsCliDecoratorOptions.DEFAULT_EXTENSION);
            options.indent.should.deep.equal(InheritsCliDecoratorOptions.DEFAULT_INDENT);
            options.linter.should.deep.equal(InheritsCliDecoratorOptions.DEFAULT_LINTER);
            Logger.should.have.been.calledOnce;
            Logger.should.have.been.calledWithNew;
        });

        it("should assign specific options when passed in", (): void => {
            const specificOptions = ["decorator", "eol", "extension", "indent", "linter", "logger"];
            const dummyValue = "qqq";
            for (const option of specificOptions) {
                const input = {} as any;
                input[option] = dummyValue;
                const options: ICliDecoratorOptions = (new InheritsCliDecoratorOptions(input) as any).options as any;
                (options as any)[option].should.deep.equal(dummyValue);
            }
        });
    });

    function resetWinston(): void {
        Logger.reset();
        silly.reset();
        Logger.returns(loggerStub);
    }
});
