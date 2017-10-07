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

const isAbsoluteStub = sinon.stub();
const resolveStub = sinon.stub();
const joinStub = sinon.stub();
const FileResolver = proxyquire("../src/lib/FileResolver", {
    /* tslint:disable-next-line:object-literal-key-quotes */
    "path": {
        "@noCallThru": true,
        isAbsolute: isAbsoluteStub,
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
        let cwd: any;

        const extensionRegExp = new RegExp(InheritsCliDecoratorOptions.DEFAULT_EXTENSION + "$");

        before((): void => {
            cwd = process.cwd();
            process.cwd = (): string => {
                return "/current/directory";
            };
        });

        let files: string[];

        const joinInput = [
            "../relative/path.ts",
            "path/with.ts",
        ];

        beforeEach((): void => {
            resetPath();
            resolveFilesStub.restore();
            files = (resolver as any).resolveFiles([
                "../relative/path",
                "path/with.ext",
                "/absolute/path",
            ]);
        });

        it("should append the proper extension", (): void => {
            isAbsoluteStub.should.have.been.calledThrice;
            for (const iteration of [0, 1, 2]) {
                const call = isAbsoluteStub.getCall(iteration);
                call.args.should.be.an("array");
                const args = call.args;
                extensionRegExp.test(args[0]).should.be.true;
            }
        });

        it("should check if each path is absolute", (): void => {
            isAbsoluteStub.should.have.been.calledThrice;
        });

        it("should join cwd only when a relative path is found", (): void => {
            joinStub.should.have.been.calledTwice;
            for (const iteration of [0, 1]) {
                const call = joinStub.getCall(iteration);
                call.args.should.be.an("array");
                const args = call.args;
                args[1].should.deep.equal(joinInput[iteration]);
            }
        });

        it("should resolve each path", (): void => {
            resolveStub.should.have.been.calledThrice;
        });

        after((): void => {
            process.cwd = cwd;
        });
    });

    afterEach((): void => {
        parseStub.restore();
        validateStub.restore();
        resolveFilesStub.restore();
    });

    function resetPath(): void {
        isAbsoluteStub.reset();
        joinStub.reset();
        resolveStub.reset();
        isAbsoluteStub.callsFake((input: string) => {
            return /^\//.test(input);
        });
        resolveStub.callsFake((input: string) => {
            return input;
        });
        joinStub.callsFake((...args: string[]) => {
            return args.join("/");
        });
    }
});
