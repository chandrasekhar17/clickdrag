import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
const pkg = require('../../package.json');
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSharedModule } from '@mhe/ngx-shared';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';

import { StoreModule } from '@ngrx/store';
import { RichTextEditorModule } from '@mhe/tinymce';
import { TinyMCEConfig } from './shared/constants/tinymce.config';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?version=' + pkg.version);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    OverlayModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      // defaultLanguage: 'es',  // Set default language to Spanish
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    RichTextEditorModule.forRoot(TinyMCEConfig),
    StoreModule.forRoot({}),
    NgxSharedModule,
  ],
  bootstrap: [AppComponent],
  exports: [RichTextEditorModule],
})
export class AppModule { }
