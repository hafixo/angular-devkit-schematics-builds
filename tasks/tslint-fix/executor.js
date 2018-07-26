"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const node_1 = require("@angular-devkit/core/node");
const fs = require("fs");
const path = require("path");
const rxjs_1 = require("rxjs");
function _loadConfiguration(Configuration, options, root, file) {
    if (options.tslintConfig) {
        return Configuration.parseConfigFile(options.tslintConfig, root);
    }
    else if (options.tslintPath) {
        return Configuration.findConfiguration(path.join(root, options.tslintPath)).results;
    }
    else if (file) {
        return Configuration.findConfiguration(null, file).results;
    }
    else {
        throw new Error('Executor must specify a tslint configuration.');
    }
}
function _getFileContent(file, options, program) {
    // The linter retrieves the SourceFile TS node directly if a program is used
    if (program) {
        const source = program.getSourceFile(file);
        if (!source) {
            const message = `File '${file}' is not part of the TypeScript project '${options.tsConfigPath}'.`;
            throw new Error(message);
        }
        return source.getFullText(source);
    }
    // NOTE: The tslint CLI checks for and excludes MPEG transport streams; this does not.
    try {
        // Strip BOM from file data.
        // https://stackoverflow.com/questions/24356713
        return fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
    }
    catch (_a) {
        throw new Error(`Could not read file '${file}'.`);
    }
}
function _listAllFiles(root) {
    const result = [];
    function _recurse(location) {
        const dir = fs.readdirSync(path.join(root, location));
        dir.forEach(name => {
            const loc = path.join(location, name);
            if (fs.statSync(path.join(root, loc)).isDirectory()) {
                _recurse(loc);
            }
            else {
                result.push(loc);
            }
        });
    }
    _recurse('');
    return result;
}
function default_1() {
    return (options, context) => {
        return new rxjs_1.Observable(obs => {
            const root = process.cwd();
            const tslint = require(node_1.resolve('tslint', {
                basedir: root,
                checkGlobal: true,
                checkLocal: true,
            }));
            const includes = (Array.isArray(options.includes)
                ? options.includes
                : (options.includes ? [options.includes] : []));
            const files = (Array.isArray(options.files)
                ? options.files
                : (options.files ? [options.files] : []));
            const Linter = tslint.Linter;
            const Configuration = tslint.Configuration;
            let program = undefined;
            let filesToLint = files;
            if (options.tsConfigPath && files.length == 0) {
                const tsConfigPath = path.join(process.cwd(), options.tsConfigPath);
                if (!fs.existsSync(tsConfigPath)) {
                    obs.error(new Error('Could not find tsconfig.'));
                    return;
                }
                program = Linter.createProgram(tsConfigPath);
                filesToLint = Linter.getFileNames(program);
            }
            if (includes.length > 0) {
                const allFilesRel = _listAllFiles(root);
                const pattern = '^('
                    + includes
                        .map(ex => '('
                        + ex.split(/[\/\\]/g).map(f => f
                            .replace(/[\-\[\]{}()+?.^$|]/g, '\\$&')
                            .replace(/^\*\*/g, '(.+?)?')
                            .replace(/\*/g, '[^/\\\\]*'))
                            .join('[\/\\\\]')
                        + ')')
                        .join('|')
                    + ')($|/|\\\\)';
                const re = new RegExp(pattern);
                filesToLint.push(...allFilesRel
                    .filter(x => re.test(x))
                    .map(x => path.join(root, x)));
            }
            const lintOptions = {
                fix: true,
                formatter: options.format || 'prose',
            };
            const linter = new Linter(lintOptions, program);
            // If directory doesn't change, we
            let lastDirectory = null;
            let config;
            for (const file of filesToLint) {
                const dir = path.dirname(file);
                if (lastDirectory !== dir) {
                    lastDirectory = dir;
                    config = _loadConfiguration(Configuration, options, root, file);
                }
                const content = _getFileContent(file, options, program);
                if (!content) {
                    continue;
                }
                linter.lint(file, content, config);
            }
            const result = linter.getResult();
            // Format and show the results.
            if (!options.silent) {
                const Formatter = tslint.findFormatter(options.format || 'prose');
                if (!Formatter) {
                    throw new Error(`Invalid lint format "${options.format}".`);
                }
                const formatter = new Formatter();
                const output = formatter.format(result.failures, result.fixes);
                if (output) {
                    context.logger.info(output);
                }
            }
            if (!options.ignoreErrors && result.errorCount > 0) {
                obs.error(new Error('Lint errors were found.'));
            }
            else {
                obs.next();
                obs.complete();
            }
        });
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MvdHNsaW50LWZpeC9leGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILG9EQUFvRDtBQUNwRCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLCtCQUFrQztBQWNsQyw0QkFDRSxhQUE2QixFQUM3QixPQUE2QixFQUM3QixJQUFZLEVBQ1osSUFBYTtJQUViLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN0RixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQzdELENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0FBQ0gsQ0FBQztBQUdELHlCQUNFLElBQVksRUFDWixPQUE2QixFQUM3QixPQUFvQjtJQUVwQiw0RUFBNEU7SUFDNUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNaLE1B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QUFDO2dCQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUNsRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBM0dELDRCQTJHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9ub2RlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBDb25maWd1cmF0aW9uIGFzIENvbmZpZ3VyYXRpb25OUyxcbiAgTGludGVyIGFzIExpbnRlck5TLFxufSBmcm9tICd0c2xpbnQnOyAgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1pbXBsaWNpdC1kZXBlbmRlbmNpZXNcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnOyAgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1pbXBsaWNpdC1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IFNjaGVtYXRpY0NvbnRleHQsIFRhc2tFeGVjdXRvciB9IGZyb20gJy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBUc2xpbnRGaXhUYXNrT3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XG5cblxudHlwZSBDb25maWd1cmF0aW9uVCA9IHR5cGVvZiBDb25maWd1cmF0aW9uTlM7XG50eXBlIExpbnRlclQgPSB0eXBlb2YgTGludGVyTlM7XG5cblxuZnVuY3Rpb24gX2xvYWRDb25maWd1cmF0aW9uKFxuICBDb25maWd1cmF0aW9uOiBDb25maWd1cmF0aW9uVCxcbiAgb3B0aW9uczogVHNsaW50Rml4VGFza09wdGlvbnMsXG4gIHJvb3Q6IHN0cmluZyxcbiAgZmlsZT86IHN0cmluZyxcbikge1xuICBpZiAob3B0aW9ucy50c2xpbnRDb25maWcpIHtcbiAgICByZXR1cm4gQ29uZmlndXJhdGlvbi5wYXJzZUNvbmZpZ0ZpbGUob3B0aW9ucy50c2xpbnRDb25maWcsIHJvb3QpO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMudHNsaW50UGF0aCkge1xuICAgIHJldHVybiBDb25maWd1cmF0aW9uLmZpbmRDb25maWd1cmF0aW9uKHBhdGguam9pbihyb290LCBvcHRpb25zLnRzbGludFBhdGgpKS5yZXN1bHRzO1xuICB9IGVsc2UgaWYgKGZpbGUpIHtcbiAgICByZXR1cm4gQ29uZmlndXJhdGlvbi5maW5kQ29uZmlndXJhdGlvbihudWxsLCBmaWxlKS5yZXN1bHRzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhlY3V0b3IgbXVzdCBzcGVjaWZ5IGEgdHNsaW50IGNvbmZpZ3VyYXRpb24uJyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0RmlsZUNvbnRlbnQoXG4gIGZpbGU6IHN0cmluZyxcbiAgb3B0aW9uczogVHNsaW50Rml4VGFza09wdGlvbnMsXG4gIHByb2dyYW0/OiB0cy5Qcm9ncmFtLFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgLy8gVGhlIGxpbnRlciByZXRyaWV2ZXMgdGhlIFNvdXJjZUZpbGUgVFMgbm9kZSBkaXJlY3RseSBpZiBhIHByb2dyYW0gaXMgdXNlZFxuICBpZiAocHJvZ3JhbSkge1xuICAgIGNvbnN0IHNvdXJjZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlKTtcbiAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgY29uc3QgbWVzc2FnZVxuICAgICAgICA9IGBGaWxlICcke2ZpbGV9JyBpcyBub3QgcGFydCBvZiB0aGUgVHlwZVNjcmlwdCBwcm9qZWN0ICcke29wdGlvbnMudHNDb25maWdQYXRofScuYDtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc291cmNlLmdldEZ1bGxUZXh0KHNvdXJjZSk7XG4gIH1cblxuICAvLyBOT1RFOiBUaGUgdHNsaW50IENMSSBjaGVja3MgZm9yIGFuZCBleGNsdWRlcyBNUEVHIHRyYW5zcG9ydCBzdHJlYW1zOyB0aGlzIGRvZXMgbm90LlxuICB0cnkge1xuICAgIC8vIFN0cmlwIEJPTSBmcm9tIGZpbGUgZGF0YS5cbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNDM1NjcxM1xuICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JykucmVwbGFjZSgvXlxcdUZFRkYvLCAnJyk7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHJlYWQgZmlsZSAnJHtmaWxlfScuYCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfbGlzdEFsbEZpbGVzKHJvb3Q6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuXG4gIGZ1bmN0aW9uIF9yZWN1cnNlKGxvY2F0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkaXIgPSBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4ocm9vdCwgbG9jYXRpb24pKTtcblxuICAgIGRpci5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgbG9jID0gcGF0aC5qb2luKGxvY2F0aW9uLCBuYW1lKTtcbiAgICAgIGlmIChmcy5zdGF0U3luYyhwYXRoLmpvaW4ocm9vdCwgbG9jKSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBfcmVjdXJzZShsb2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobG9jKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBfcmVjdXJzZSgnJyk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpOiBUYXNrRXhlY3V0b3I8VHNsaW50Rml4VGFza09wdGlvbnM+IHtcbiAgcmV0dXJuIChvcHRpb25zOiBUc2xpbnRGaXhUYXNrT3B0aW9ucywgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgY29uc3Qgcm9vdCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgICBjb25zdCB0c2xpbnQgPSByZXF1aXJlKHJlc29sdmUoJ3RzbGludCcsIHtcbiAgICAgICAgYmFzZWRpcjogcm9vdCxcbiAgICAgICAgY2hlY2tHbG9iYWw6IHRydWUsXG4gICAgICAgIGNoZWNrTG9jYWw6IHRydWUsXG4gICAgICB9KSk7XG4gICAgICBjb25zdCBpbmNsdWRlcyA9IChcbiAgICAgICAgQXJyYXkuaXNBcnJheShvcHRpb25zLmluY2x1ZGVzKVxuICAgICAgICAgID8gb3B0aW9ucy5pbmNsdWRlc1xuICAgICAgICAgIDogKG9wdGlvbnMuaW5jbHVkZXMgPyBbb3B0aW9ucy5pbmNsdWRlc10gOiBbXSlcbiAgICAgICk7XG4gICAgICBjb25zdCBmaWxlcyA9IChcbiAgICAgICAgQXJyYXkuaXNBcnJheShvcHRpb25zLmZpbGVzKVxuICAgICAgICAgID8gb3B0aW9ucy5maWxlc1xuICAgICAgICAgIDogKG9wdGlvbnMuZmlsZXMgPyBbb3B0aW9ucy5maWxlc10gOiBbXSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IExpbnRlciA9IHRzbGludC5MaW50ZXIgYXMgTGludGVyVDtcbiAgICAgIGNvbnN0IENvbmZpZ3VyYXRpb24gPSB0c2xpbnQuQ29uZmlndXJhdGlvbiBhcyBDb25maWd1cmF0aW9uVDtcbiAgICAgIGxldCBwcm9ncmFtOiB0cy5Qcm9ncmFtIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgbGV0IGZpbGVzVG9MaW50OiBzdHJpbmdbXSA9IGZpbGVzO1xuXG4gICAgICBpZiAob3B0aW9ucy50c0NvbmZpZ1BhdGggJiYgZmlsZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIG9wdGlvbnMudHNDb25maWdQYXRoKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNDb25maWdQYXRoKSkge1xuICAgICAgICAgIG9icy5lcnJvcihuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRzY29uZmlnLicpKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwcm9ncmFtID0gTGludGVyLmNyZWF0ZVByb2dyYW0odHNDb25maWdQYXRoKTtcbiAgICAgICAgZmlsZXNUb0xpbnQgPSBMaW50ZXIuZ2V0RmlsZU5hbWVzKHByb2dyYW0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5jbHVkZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhbGxGaWxlc1JlbCA9IF9saXN0QWxsRmlsZXMocm9vdCk7XG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSAnXignXG4gICAgICAgICAgKyAoaW5jbHVkZXMgYXMgc3RyaW5nW10pXG4gICAgICAgICAgICAubWFwKGV4ID0+ICcoJ1xuICAgICAgICAgICAgICArIGV4LnNwbGl0KC9bXFwvXFxcXF0vZykubWFwKGYgPT4gZlxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSs/Ll4kfF0vZywgJ1xcXFwkJicpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL15cXCpcXCovZywgJyguKz8pPycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKi9nLCAnW14vXFxcXFxcXFxdKicpKVxuICAgICAgICAgICAgICAgIC5qb2luKCdbXFwvXFxcXFxcXFxdJylcbiAgICAgICAgICAgICAgKyAnKScpXG4gICAgICAgICAgICAuam9pbignfCcpXG4gICAgICAgICAgKyAnKSgkfC98XFxcXFxcXFwpJztcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuXG4gICAgICAgIGZpbGVzVG9MaW50LnB1c2goLi4uYWxsRmlsZXNSZWxcbiAgICAgICAgICAuZmlsdGVyKHggPT4gcmUudGVzdCh4KSlcbiAgICAgICAgICAubWFwKHggPT4gcGF0aC5qb2luKHJvb3QsIHgpKSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGludE9wdGlvbnMgPSB7XG4gICAgICAgIGZpeDogdHJ1ZSxcbiAgICAgICAgZm9ybWF0dGVyOiBvcHRpb25zLmZvcm1hdCB8fCAncHJvc2UnLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgbGludGVyID0gbmV3IExpbnRlcihsaW50T3B0aW9ucywgcHJvZ3JhbSk7XG4gICAgICAvLyBJZiBkaXJlY3RvcnkgZG9lc24ndCBjaGFuZ2UsIHdlXG4gICAgICBsZXQgbGFzdERpcmVjdG9yeTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBsZXQgY29uZmlnO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb0xpbnQpIHtcbiAgICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKGZpbGUpO1xuICAgICAgICBpZiAobGFzdERpcmVjdG9yeSAhPT0gZGlyKSB7XG4gICAgICAgICAgbGFzdERpcmVjdG9yeSA9IGRpcjtcbiAgICAgICAgICBjb25maWcgPSBfbG9hZENvbmZpZ3VyYXRpb24oQ29uZmlndXJhdGlvbiwgb3B0aW9ucywgcm9vdCwgZmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udGVudCA9IF9nZXRGaWxlQ29udGVudChmaWxlLCBvcHRpb25zLCBwcm9ncmFtKTtcblxuICAgICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbnRlci5saW50KGZpbGUsIGNvbnRlbnQsIGNvbmZpZyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGxpbnRlci5nZXRSZXN1bHQoKTtcblxuICAgICAgLy8gRm9ybWF0IGFuZCBzaG93IHRoZSByZXN1bHRzLlxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICBjb25zdCBGb3JtYXR0ZXIgPSB0c2xpbnQuZmluZEZvcm1hdHRlcihvcHRpb25zLmZvcm1hdCB8fCAncHJvc2UnKTtcbiAgICAgICAgaWYgKCFGb3JtYXR0ZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbGludCBmb3JtYXQgXCIke29wdGlvbnMuZm9ybWF0fVwiLmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoKTtcblxuICAgICAgICBjb25zdCBvdXRwdXQgPSBmb3JtYXR0ZXIuZm9ybWF0KHJlc3VsdC5mYWlsdXJlcywgcmVzdWx0LmZpeGVzKTtcbiAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgIGNvbnRleHQubG9nZ2VyLmluZm8ob3V0cHV0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JzICYmIHJlc3VsdC5lcnJvckNvdW50ID4gMCkge1xuICAgICAgICBvYnMuZXJyb3IobmV3IEVycm9yKCdMaW50IGVycm9ycyB3ZXJlIGZvdW5kLicpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9icy5uZXh0KCk7XG4gICAgICAgIG9icy5jb21wbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufVxuIl19