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

const isAbsolute = sinon.stub();
const resolve = sinon.stub();
const join = sinon.stub();
const FileResolver = proxyquire("../src/lib/FileResolver", {
    /* tslint:disable-next-line:object-literal-key-quotes */
    "path": {
        "@noCallThru": true,
        isAbsolute,
        join,
        resolve,
        sep: "/",
    },
}).FileResolver;

describe("FileResolver", (): void => {
    let parseArgvStub: sinon.SinonStub;
    let validateFilesStub: sinon.SinonStub;
    let resolveFilesStub: sinon.SinonStub;
    let fileResolver: any;

    beforeEach((): void => {
        parseArgvStub = sinon.stub(FileResolver.prototype as any, "parseArgv");
        validateFilesStub = sinon.stub(FileResolver.prototype as any, "validateFiles");
        resolveFilesStub = sinon.stub(FileResolver.prototype as any, "resolveFiles");
        fileResolver = new FileResolver({} as any);
    });

    describe("constructor", (): void => {
        it("should resolve the parsed and validated files", (): void => {
            parseArgvStub.should.be.calledOnce;
            validateFilesStub.should.be.calledOnce;
            validateFilesStub.should.be.calledAfter(parseArgvStub);
            resolveFilesStub.should.be.calledOnce;
            resolveFilesStub.should.be.calledAfter(validateFilesStub);
        });
    });

    describe("parseArgv", (): void => {
        let savedArgv: string[];

        before((): void => {
            savedArgv = process.argv;
        });

        let files: string[];

        beforeEach((): void => {
            parseArgvStub.restore();
            process.argv = [
                "/path/to/node",
                "/path/to/script",
                "arg1",
                "arg2",
            ];
            files = (fileResolver as any).parseArgv();
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
            validateFilesStub.restore();
        });

        it("should throw if no input found", (): void => {
            (fileResolver as any).validateFiles.bind(fileResolver, [])
                .should.throw(FileResolver.ERROR_NO_INPUT);
        });

        it("should do nothing if input is found", (): void => {
            // Binding valid input isn't enough to check the else branch
            (fileResolver as any).validateFiles(["one", "two"]);
            // If the above doesn't throw, it's properly validated
            true.should.be.true;
        });
    });

    describe("resolveFiles", (): void => {
        let cwd: any;

        const extensionRegExp = new RegExp(InheritsCliDecoratorOptions.DEFAULT_EXTENSION + "$");

        before((): void => {
            cwd = process.cwd;
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
            files = (fileResolver as any).resolveFiles([
                "../relative/path",
                "path/with.ext",
                "/absolute/path",
            ]);
        });

        it("should append the proper extension", (): void => {
            isAbsolute.should.have.been.calledThrice;
            for (const iteration of [0, 1, 2]) {
                const call = isAbsolute.getCall(iteration);
                call.args.should.be.an("array");
                const args = call.args;
                extensionRegExp.test(args[0]).should.be.true;
            }
        });

        it("should check if each path is absolute", (): void => {
            isAbsolute.should.have.been.calledThrice;
        });

        it("should join cwd only when a relative path is found", (): void => {
            join.should.have.been.calledTwice;
            for (const iteration of [0, 1]) {
                const call = join.getCall(iteration);
                call.args.should.be.an("array");
                const args = call.args;
                args[1].should.deep.equal(joinInput[iteration]);
            }
        });

        it("should resolve each path", (): void => {
            resolve.should.have.been.calledThrice;
        });

        after((): void => {
            process.cwd = cwd;
        });
    });

    afterEach((): void => {
        parseArgvStub.restore();
        validateFilesStub.restore();
        resolveFilesStub.restore();
    });

    function resetPath(): void {
        isAbsolute.reset();
        join.reset();
        resolve.reset();
        isAbsolute.callsFake((input: string) => {
            return /^\//.test(input);
        });
        resolve.callsFake((input: string) => {
            return input;
        });
        join.callsFake((...args: string[]) => {
            return args.join("/");
        });
    }
});
