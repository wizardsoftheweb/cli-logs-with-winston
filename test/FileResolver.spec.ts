/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const should = chai.should();
chai.use(sinonChai);

const resolveStub = sinon.stub();
const joinStub = sinon.stub();
const basenameStub = sinon.stub();
const FileResolver = proxyquire("../src/lib/FileResolver", {
    /* tslint:disable-next-line:object-literal-key-quotes */
    "path": {
        "@noCallThru": true,
        basename: basenameStub,
        join: joinStub,
        resolve: resolveStub,
        sep: "/",
    },
}).FileResolver;

describe("FileResolver", (): void => {
    let parseStub: sinon.SinonStub;
    let validateStub: sinon.SinonStub;
    let resolveFilesStub: sinon.SinonStub;
    let resolver: any;

    beforeEach((): void => {
        parseStub = sinon.stub(FileResolver.prototype as any, "parseArgv");
        validateStub = sinon.stub(FileResolver.prototype as any, "validateFiles");
        resolveFilesStub = sinon.stub(FileResolver.prototype as any, "resolveFiles");
        resolver = new FileResolver({} as any);
    });

    describe("constructor", (): void => {
        it("should resolve the parsed and validated files", (): void => {
            parseStub.should.be.calledOnce;
            validateStub.should.be.calledOnce;
            validateStub.should.be.calledAfter(parseStub);
            resolveFilesStub.should.be.calledOnce;
            resolveFilesStub.should.be.calledAfter(validateStub);
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

    describe("validateFiles", (): void => {
        beforeEach((): void => {
            validateStub.restore();
        });

        it("should throw if no input found", (): void => {
            (resolver as any).validateFiles.bind(resolver, [])
                .should.throw(FileResolver.ERROR_NO_INPUT);
        });

        it("should do nothing if input is found", (): void => {
            // Binding valid input isn't enough to check the else branch
            (resolver as any).validateFiles(["one", "two"]);
            // If the above doesn't throw, it's properly validated
            true.should.be.true;
        });
    });

    describe("resolveFiles", (): void => {

    });

    afterEach((): void => {
        parseStub.restore();
        validateStub.restore();
        resolveFilesStub.restore();
    });
});
