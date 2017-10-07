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

    beforeEach((): void => {
        decorateStub = sinon.stub(DecoratorImplementor.prototype as any, "decorate");
        decoratorImplementor = new DecoratorImplementor({} as any);
    });

    afterEach((): void => {
        decorateStub.restore();
    });
});
