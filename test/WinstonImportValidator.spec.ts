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

const basename = sinon.stub();
const readFileSync = sinon.stub();
const writeFileSync = sinon.stub();
const WinstonImportValidator = proxyquire("../src/lib/WinstonImportValidator", {}).WinstonImportValidator;

describe("WinstonImportValidator", (): void => {
    let checkWinstonImportStub: sinon.SinonStub;
    let winstonImportValidator: any;

    const dummyContents = "qqq";

    beforeEach((): void => {
        checkWinstonImportStub = sinon.stub(WinstonImportValidator.prototype as any, "checkWinstonImport");
        winstonImportValidator = new WinstonImportValidator(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should check the given contents", (): void => {
            checkWinstonImportStub.should.have.been.calledOnce;
            checkWinstonImportStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    afterEach((): void => {
        checkWinstonImportStub.restore();
    });
});
