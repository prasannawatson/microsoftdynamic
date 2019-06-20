import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faSquare, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
// import { faSquare as farSquare, faCheckSquare as farCheckSquare } from '@fortawesome/free-regular-svg-icons';
// import { faStackOverflow, faGithub, faMedium } from '@fortawesome/free-brands-svg-icons';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MicrosoftDynamicIntegrationPageComponent } from './microsoft-dynamic-integration-page/microsoft-dynamic-integration-page.component';
import { MicrosoftDynamicHeaderComponent } from './microsoft-dynamic-header/microsoft-dynamic-header.component';
import { MicrosoftDynamicMenuComponent } from './microsoft-dynamic-menu/microsoft-dynamic-menu.component';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    MicrosoftDynamicIntegrationPageComponent,
    MicrosoftDynamicHeaderComponent,
    MicrosoftDynamicMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule, MatCheckboxModule,MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
 
 }
