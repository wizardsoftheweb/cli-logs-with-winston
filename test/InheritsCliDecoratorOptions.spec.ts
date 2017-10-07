/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import {EOL} from "os";

const should = chai.should();
chai.use(sinonChai);

const Logger = sinon.stub();
const InheritsCliDecoratorOptions = proxyquire("../src/lib/InheritsCliDecoratorOptions", {
    /* tslint:disable:object-literal-key-quotes */
    "winston": {
        "@noCallThru": true,
        Logger,
    },
    /* tslint:enable:object-literal-key-quotes */
}).InheritsCliDecoratorOptions;

describe("InheritsCliDecoratorOptions", (): void => {
    let resolver: any;

    beforeEach((): void => {
        resolver = new InheritsCliDecoratorOptions({} as any);
    });

    function resetWinston(): void {
        Logger.reset();
    }
});
