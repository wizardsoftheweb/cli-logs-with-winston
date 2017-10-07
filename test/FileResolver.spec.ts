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

    describe("parseArgv", (): void => {
        let savedArgv: string[];

        before((): void => {
            savedArgv = process.argv;
        });

        let files: string[];

        beforeEach((): void => {
            parseStub.restore();
            process.argv = [
                "/path/to/node",
                "/path/to/script",
                "arg1",
                "arg2",
            ];
            files = (resolver as any).parseArgv();
        });

        it("should strip node and calling script from argv", (): void => {
            files.indexOf(process.argv[0]).should.equal(-1);
            files.indexOf(process.argv[1]).should.equal(-1);
        });

        it("should pass on the remaining input", (): void => {
            files.should.deep.equal(process.argv.slice(2));
        });

        after((): void => {
            process.argv = savedArgv;
        });
    });

    afterEach((): void => {
        parseStub.restore();
        validateStub.restore();
        resolveStub.restore();
    });
});
