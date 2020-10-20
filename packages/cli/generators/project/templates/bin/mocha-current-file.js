#!/usr/bin/env node

/*
================================================================================
This is used in the launch.json to enable you to debug a test file written in
typescript.  This function attempts to convert the passed typescript file to
the best-guess output javascript file.

It walks up the filesystem from the current file, stops at package.json, and
looks in `dist`.
================================================================================
*/

'use strict';
const path = require('path');
const fs = require('fs');

function findDistFile(filename) {
  const absolutePath = path.resolve(filename);
  const systemRoot = path.parse(absolutePath).root;
  let currentDir = path.dirname(absolutePath);

  let isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  while (!isPackageRoot) {
    if (path.dirname(currentDir) === systemRoot) {
      throw new Error(
        `Could not find a package.json file in the path heirarchy of ${absolutePath}`,
      );
    }
    currentDir = path.join(currentDir, '..');
    isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  }
  const base = path.resolve(currentDir);
  const relative = path.relative(currentDir, absolutePath);
  const resultPath = relative.replace(/^src/, 'dist').replace(/\.ts$/, '.js');
  return path.resolve(base, resultPath);
}

const newFile = findDistFile(process.argv.splice(-1)[0]);

if (newFile) {
  require('../node_modules/mocha/lib/cli').main(
    [...process.argv, newFile].slice(2),
  );
}
