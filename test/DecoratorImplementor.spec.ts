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

const DecoratorImplementor = proxyquire("../src/lib/DecoratorImplementor", {}).DecoratorImplementor;

describe("DecoratorImplementor", (): void => {
    let decorateStub: sinon.SinonStub;
    let decoratorImplementor: any;

    const dummyContents = "qqq";

    beforeEach((): void => {
        decorateStub = sinon.stub(DecoratorImplementor.prototype as any, "decorate");
        decoratorImplementor = new DecoratorImplementor(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should load decorate the given file", (): void => {
            decorateStub.should.have.been.calledOnce;
            decorateStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    describe("determineWinstonUsage", (): void => {
        it("should find '* as winston'", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import * as winston from 'winston';",
            );
            loggerInstance.should.equal("winston.LoggerInstance");
        });

        it("should find '{ LoggerInstance as SomethingElse }'", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import { LoggerInstance as SomethingElse } from 'winston';",
            );
            loggerInstance.should.equal("SomethingElse");
        });

        it("should assume LoggerInstance otherwise", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import { LoggerInstance } from 'winston';",
            );
            loggerInstance.should.equal("LoggerInstance");
        });
    });

    afterEach((): void => {
        decorateStub.restore();
    });
});
