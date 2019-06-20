import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MicrosoftDynamicIntegrationPageComponent }      from './microsoft-dynamic-integration-page/microsoft-dynamic-integration-page.component';


const routes: Routes = [
  { path: 'microsoft-dynamic-integration-page', component: MicrosoftDynamicIntegrationPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
