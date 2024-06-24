import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import externalJsFiles from './external-js-files';
import * as loadExternalScript from 'little-loader';

if (environment.production) {
  enableProdMode();
}

window['startBootStrappingApp'] = () => {
  window['mode'] = EZ.mode; //This is required for backward state compatibility.
  const extJsFiles = externalJsFiles[EZ.mode] || [];
  Promise.all<void>(
    Object.values(extJsFiles).map((url) => {
      return new Promise((resolve, reject) => {
        loadExternalScript(url, (err) => (err ? reject(err) : resolve()));
      });
    })
  ).then(() => {
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.log(err));
  });
};
