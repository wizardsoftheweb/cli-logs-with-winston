/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as Bluebird from "bluebird";
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import { EOL } from "os";
import * as path from "path";
import * as proxyquire from "proxyquire";
import * as shelljs from "shelljs";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const should = chai.should();
chai.use(sinonChai);

const tmpDir = path.resolve(path.join(__dirname, "..", "..", ".binIntegrationTest"));
const tsLint = path.resolve(path.join(__dirname, "..", "..", "node_modules", ".bin", "tslint"));
const tsNode = path.resolve(path.join(__dirname, "..", "..", "node_modules", ".bin", "ts-node"));
const tsc = path.resolve(path.join(__dirname, "..", "..", "node_modules", ".bin", "tsc"));
const logsWithWinstonCli = path.resolve(path.join(__dirname, "..", "..", "src", "bin", "logs-with-winston.ts"));

describe("Decorating vanilla classes", (): void => {
    before((): Bluebird<void> => {
        return new Bluebird((resolve, reject) => {
            shelljs.rm("-rf", tmpDir);
            shelljs.mkdir("-p", path.join(tmpDir, "src"));
            const files = shelljs.find(path.join(__dirname, "input"));
            for (const filename of files) {
                if (filename.match(/\.json$/i)) {
                    shelljs.cp(filename, tmpDir);
                } else if (filename.match(/\.ts$/i)) {
                    shelljs.cp(filename, path.join(tmpDir, "src"));
                }
            }
            resolve();
        });
    });

    beforeEach((): void => {
        shelljs.cd(tmpDir);
    });

    describe("pre-decoration", (): void => {
        beforeEach((): void => {
            dumpDist();
        });

        it("should lint without error", (): Bluebird<void> => {
            return lint()
                .then((input: string): void => {
                    input.should.have.lengthOf(0);
                });
        }).timeout(10000);

        it("should compile without error", (): Bluebird<void> => {
            return compile()
                .then((input: string): void => {
                    input.should.have.lengthOf(0);
                });
        }).timeout(10000);

        after((): void => {
            dumpDist();
        });
    });

    describe("decoration", (): void => {
        it("should decorate each file without error", (): Bluebird<void> => {
            return new Bluebird((resolve, reject) => {
                const filenames = shelljs.find(path.join(tmpDir, "src", "*.ts"));
                const commands: string[] = [];
                for (const filename of filenames) {
                    commands.push(`${logsWithWinstonCli} ${filename}`);
                }
                resolve(commands);
            })
                .each((command: string) => {
                    return new Bluebird((resolve, reject) => {
                        return shelljs.exec(
                            command,
                            { silent: true },
                            (code: number, stdout: string, stderror: string) => {
                                const result = stdout.trim();
                                if (result.length > 0 || code !== 0) {
                                    return reject(result);
                                } else {
                                    return resolve(result);
                                }
                            },
                        );
                    });
                })
                .then((): void => {
                    //
                });
        }).timeout(20000);

        it("should decorate a new file without error", (): Bluebird<void> => {
            return new Bluebird((resolve, reject) => {
                return shelljs.exec(
                    `${logsWithWinstonCli} src/Whoopsie`,
                    { silent: true },
                    (code: number, stdout: string, stderror: string) => {
                        const result = stdout.trim();
                        if (result.length > 0 || code !== 0) {
                            return reject(result);
                        } else {
                            return resolve(result);
                        }
                    },
                );
            })
            .then(() => {
                //
            });
        });
    });

    // describe("post-decoration", (): void => {
    //     beforeEach((): void => {
    //         dumpDist();
    //     });

    //     it("should lint without error", (): Bluebird<void> => {
    //         return lint()
    //             .then((input: string): void => {
    //                 input.should.have.lengthOf(0);
    //             });
    //     }).timeout(10000);

    //     it("should compile without error", (): Bluebird<void> => {
    //         return compile()
    //             .then((input: string): void => {
    //                 input.should.have.lengthOf(0);
    //             });
    //     }).timeout(10000);

    //     after((): void => {
    //         dumpDist();
    //     });
    // });

    function dumpDist(): void {
        shelljs.rm("-rf", path.join(tmpDir, "dist"));
    }

    function lint(): Bluebird<any> {
        return new Bluebird((resolve, reject) => {
            return shelljs.exec(
                `${tsLint} -c ./tslint.json -p ./tsconfig.json --type-check`,
                // { silent: true },
                (code: number, stdout: string, stderror: string) => {
                    const result = stdout.trim();
                    if (result.length > 0 || code !== 0) {
                        console.log(result);
                        return reject(result);
                    } else {
                        return resolve(result);
                    }
                },
            );
        });
    }

    function compile(): Bluebird<any> {
        return new Bluebird((resolve, reject) => {
            return shelljs.exec(
                `${tsc} --p ./tsconfig.json`,
                { silent: true },
                (code: number, stdout: string, stderror: string) => {
                    const result = stdout.trim();
                    if (result.length > 0 || code !== 0) {
                        return reject(result);
                    } else {
                        return resolve(result);
                    }
                },
            );
        });
    }
});
