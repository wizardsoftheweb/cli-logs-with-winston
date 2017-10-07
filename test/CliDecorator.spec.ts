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

const writeFileSync = sinon.stub();
const ClassLoader = sinon.stub();
const DecoratorImplementor = sinon.stub();
const FileResolver = sinon.stub();
const WinstonImportValidator = sinon.stub();
const CliDecorator = proxyquire("../src/lib/CliDecorator", {
    /* tslint:disable:object-literal-key-quotes */
    "./ClassLoader": {
        "@noCallThru": true,
        ClassLoader,
    },
    "./DecoratorImplementor": {
        "@noCallThru": true,
        DecoratorImplementor,
    },
    "./FileResolver": {
        "@noCallThru": true,
        FileResolver,
    },
    "./WinstonImportValidator": {
        "@noCallThru": true,
        WinstonImportValidator,
    },
    "fs": {
        "@noCallThru": true,
        writeFileSync,
    },
    /* tslint:enable:object-literal-key-quotes */
}).CliDecorator;

describe("CliDecorator", (): void => {
    let decorateStub: sinon.SinonStub;
    let resolver: any;

    beforeEach((): void => {
        decorateStub = sinon.stub(CliDecorator.prototype as any, "decorate");
        resolver = new CliDecorator({} as any);
    });

    afterEach((): void => {
        decorateStub.restore();
    });

    function resetFs(): void {
        writeFileSync.reset();
    }
});
