import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DndModule } from 'ngx-drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { App } from './app';
import { Header } from './header';
import { Victories } from './victories/victories';

@NgModule({
  declarations: [
    App,
    Header,
    Victories
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DndModule,
    BrowserAnimationsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
