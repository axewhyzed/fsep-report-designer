import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DesignViewComponent } from './design-view/design-view.component';
import { NavigationPanelComponent } from './navigation-panel/navigation-panel.component';
import { RibbonComponent } from './ribbon/ribbon.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { PrintPreviewComponent } from './print-preview/print-preview.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DesignViewComponent,
    NavigationPanelComponent,
    RibbonComponent,
    StatusBarComponent,
    PrintPreviewComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
