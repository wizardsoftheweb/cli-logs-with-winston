/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const should = chai.should();
chai.use(sinonChai);

import { FileResolver } from "../src/lib/FileResolver";

describe("FileResolver", (): void => {
    let parseStub: sinon.SinonStub;
    let validateStub: sinon.SinonStub;
    let resolveStub: sinon.SinonStub;
    let resolver: FileResolver;

    beforeEach((): void => {
        parseStub = sinon.stub(FileResolver.prototype as any, "parseArgv");
        validateStub = sinon.stub(FileResolver.prototype as any, "validateFiles");
        resolveStub = sinon.stub(FileResolver.prototype as any, "resolveFiles");
        resolver = new FileResolver({} as any);
    });

    describe("constructor", (): void => {
        it("should resolve the parsed and validated files", (): void => {
            parseStub.should.be.calledOnce;
            validateStub.should.be.calledOnce;
            validateStub.should.be.calledAfter(parseStub);
            resolveStub.should.be.calledOnce;
            resolveStub.should.be.calledAfter(validateStub);
        });
    });

    afterEach((): void => {
        parseStub.restore();
        validateStub.restore();
        resolveStub.restore();
    });
});
