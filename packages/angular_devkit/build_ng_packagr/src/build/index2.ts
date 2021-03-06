/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect/src/index2';
import { resolve } from 'path';
import { Observable, from } from 'rxjs';
import { catchError, mapTo, switchMap } from 'rxjs/operators';
import { Schema as NgPackagrBuilderOptions } from './schema';

async function initialize(
  options: NgPackagrBuilderOptions,
  root: string,
): Promise<import ('ng-packagr').NgPackagr> {
  const packager = (await import('ng-packagr')).ngPackagr();

  packager.forProject(resolve(root, options.project));

  if (options.tsConfig) {
    packager.withTsConfig(resolve(root, options.tsConfig));
  }

  return packager;
}

export function buildLibrary(
  options: NgPackagrBuilderOptions,
  context: BuilderContext,
): Observable<BuilderOutput> {
  return from(initialize(options, context.workspaceRoot)).pipe(
    switchMap(packager => options.watch ? packager.watch() : packager.build()),
    mapTo({ success: true }),
    catchError(error => {
      context.reportStatus('Error: ' + error);

      return [{ success: false }];
    }),
  );
}

export default createBuilder<Record<string, string> & NgPackagrBuilderOptions>(buildLibrary);
