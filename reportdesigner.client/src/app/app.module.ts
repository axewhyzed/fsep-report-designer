import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DesignViewComponent } from './design-view/design-view.component';
import { RibbonComponent } from './ribbon/ribbon.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { NavigationPanelComponent } from './navigation-panel/navigation-panel.component';
import { FormsModule } from '@angular/forms';
import { PrintPreviewComponent } from './print-preview/print-preview.component';
import { DataToolbarComponent } from './data-toolbar/data-toolbar.component';
import { NgxPrintModule } from 'ngx-print';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    DesignViewComponent,
    RibbonComponent,
    StatusBarComponent,
    NavigationPanelComponent,
    PrintPreviewComponent,
    DataToolbarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgxPrintModule,
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
