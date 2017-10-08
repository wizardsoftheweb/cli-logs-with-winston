# `@wizardsoftheweb/cli-logs-with-winston`

[![Build Status](https://travis-ci.org/wizardsoftheweb/cli-logs-with-winston.svg?branch=master)](https://travis-ci.org/wizardsoftheweb/cli-logs-with-winston) [![Coverage Status](https://coveralls.io/repos/github/wizardsoftheweb/cli-logs-with-winston/badge.svg?branch=master)](https://coveralls.io/github/wizardsoftheweb/cli-logs-with-winston?branch=master)

<!-- MarkdownTOC -->

- [Installation](#installation)
- [Tests](#tests)
- [Usage](#usage)
    - [API](#api)
        - [`(node_modules/.bin/)logs-with-winston [FILE]...`](#nodemodulesbinlogs-with-winstonfile)
        - [`CliDecorator`](#clidecorator)
    - [Examples](#examples)
        - [Integration Tests](#integrationtests)
        - [Making Do](#makingdo)
- [Scope?](#scope)
- [Roadmap](#roadmap)
    - [Main Features](#mainfeatures)
    - [Eventual features](#eventualfeatures)

<!-- /MarkdownTOC -->


## Installation

```bash
npm install @wizardsoftheweb/cli-logs-with-winston
```

## Tests

```bash
npm install git+https://github.com/wizardsoftheweb/cli-logs-with-winston
npm t
```
The [integration tests](https://github.com/wizardsoftheweb/cli-logs-with-winston/tree/master/test/integration) run incredibly slow (~20secs per), so you might not want to bolt those into anything you're doing.

## Usage

### API

#### `(node_modules/.bin/)logs-with-winston [FILE]...`

Depending on how you have your path set up, you might need to prepend the `.bin` folder.

`logs-with-winston` does several things:
1. Parses a list of (possible) filenames from the command line
2. Loads or creates each specified file
3. Checks for or creates a `winston.LoggerInstance` import in each file
4. Checks for or creates `LogsWithWinston.LogsWithWinston` and `LogsWithWinston.ILogsWithWinston` imports in each file
5. Decorates each class in each file:
    1. Inserts `@LogsWithWinston()` if no decorator is found
    2. Appends the proper `implements ILogsWithWinston`
    3. Inserts `ILogsWithWinston` implementation wrapped in comments

Note that `logs-with-winston` has zero globbing capabilities. You'll have to rely on your shell for that.

#### `CliDecorator`

I've exposed as much of the config as I could (some of the regex is super brittle), but I also don't have a huge interest in adding CLI options or loading config from a file. Pull requests are welcome, as are forks. Exposing the inputs [is on the roadmap](#eventualfeatures) but I doubt it will hit `v1`.

### Examples

In general, you can run
```bash
logs-with-winston ClassToDecorate relative/path/to/ClassToDecorate /path/to/ClassToDecorate.ts
```
which should decorate the files in place.

#### Integration Tests

The [integration tests](https://github.com/wizardsoftheweb/cli-logs-with-winston/tree/master/test/integration) provide a great glimpse into how the whole thing works. If you comment out the final `after` in each
```typescript
    ...
    // after((): Bluebird<void> => {
    //    shelljs.rm("-rf", tmpDir);
    //    return Bluebird.resolve();
    // });
    ...
```
and run each test individually
```bash
$ mocha test/integration/imports-logs-with-winston.integration.ts
$ mocha test/integration/imports-winston.integration.ts
$ mocha test/integration/vanilla.integration.ts
```
you can follow the changes in `.binIntegrationTest`

#### Making Do

There's an obscenely high chance that you don't format your code the same way I do. If you're running [EditorConfig](http://editorconfig.org/) (protip: you should be), setting EOL and paths using the proper library calls, and run a linter capable of fixing minor issues, you can probably adapt the output without much trouble. Here's a few ideas:
1. TypeScript:
    ```typescript
    import {
        join,
        resolve,
    } from "path";
    import {
        exec,
        find,
    } from "shelljs";

    // make it easy to get to logs-with-winston
    logsWithWinstonPath = resolve(join(__dirname, "relative", "path", "to", ".bin"));
    // find all the files you want to modify
    const filenames = find("path", "to", "files");
    // Quote the filenames just in case
    exec(${logsWithWinstonPath} '${filenames.join(' ')}')
    ```
2. GNU `find`:
    ```bash
    find /path/to/files -type f -name "*.ts" -exec /path/to/.bin/logs-with-winston {} \+
    ```
    * `-type f`: only files (not directories)
    * `-name "*.ts"`: only TypeScript (or whatever) files
    * `-exec`: execute a command with found files
    * `{} \+`: append each filename, i.e. run the command once (escape the `+` to be safe)
    * [`man --pager="less -p '-exec\s+command\s+\{\}\s+\+'" find`](http://man7.org/linux/man-pages/man1/find.1.html)
3. Shell globs (`zsh` in the example):
    ```zsh
    /path/to/.bin/logs-with-winston /path/to/files/**/*
    ```

## Scope?

Polluting the global namespace is generally considered a bad idea, so why would you do it on NPM?

## Roadmap

These percentages are pretty arbitrary. Today's 47% could be tomorrow's 90% or vice versa.

### Main Features

Once all of these are finished, I'll release `v1`. Until then, `v0` should be used with caution, because it's not stable.

| Progess | Feature |
| ------: | ------- |
|    100% | Add bin script |
|     80% | Test |
|     90% | Export the full namespace |
|     90% | Compile declaration file |
|      0% | Figure out `git` strategy for easy reverts |
|     50% | Write docs |
|      0% | Publish package on `npm` |

### Eventual features

These are things I'd like to add, but probably won't be included in `v1`. If not, they'll most likely constitute one or more minor version increments.

| Progess | Feature |
| ------: | ------- |
|      0% | [Greenkeeper](https://greenkeeper.io/) (or similar) integration |
|      0% | Provide ability to programmatically pass files to `FileResolver`/`CliDecorator` |
|      0% | Create examples|
|      0% | Containerize examples|
