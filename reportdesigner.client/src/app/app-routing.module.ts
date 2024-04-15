import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignViewComponent } from './design-view/design-view.component';
import { PrintPreviewComponent } from './print-preview/print-preview.component';

const routes: Routes = [
  { path: 'design-view', component: DesignViewComponent },
  { path: 'print-preview', component: PrintPreviewComponent },
  { path: '', redirectTo: '/design-view', pathMatch: 'full' }, // Default route
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
