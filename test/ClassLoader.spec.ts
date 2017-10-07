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
const ClassLoader = proxyquire("../src/lib/ClassLoader", {
    /* tslint:disable:object-literal-key-quotes */
    "fs": {
        "@noCallThru": true,
        readFileSync,
        writeFileSync,
    },
    "path": {
        "@noCallThru": true,
        basename,
    },
    /* tslint:enable:object-literal-key-quotes */
}).ClassLoader;

describe("ClassLoader", (): void => {
    let loadClassStub: sinon.SinonStub;
    let classLoader: any;

    const fileToLoad = "/path/to/file.ts";

    beforeEach((): void => {
        loadClassStub = sinon.stub(ClassLoader.prototype as any, "loadClass");
        classLoader = new ClassLoader(fileToLoad, {} as any);
    });

    describe("constructor", (): void => {
        it("should load the given filename", (): void => {
            loadClassStub.should.have.been.calledOnce;
            loadClassStub.should.have.been.calledWithExactly(fileToLoad);
        });
    });

    afterEach((): void => {
        loadClassStub.restore();
    });

    function resetFs(): void {
        readFileSync.reset();
        writeFileSync.reset();
    }

    function resetPath(): void {
        basename.reset();
        basename.callsFake((input: string) => {
            return input.replace(/\.\w+$/i, "");
        });
    }
});
