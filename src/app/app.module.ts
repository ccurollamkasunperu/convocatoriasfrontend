import { BrowserModule } from "@angular/platform-browser";
import { LOCALE_ID, NgModule } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { ROUTES } from "./app.routes";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectConfig } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { MenuComponent } from "./components/menu/menu.component";
import { AgmCoreModule } from "@agm/core";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { ModalModule } from "ngx-bootstrap/modal";
import { LoginComponent } from "./pages/login/login.component";
import { TreeviewModule } from "ngx-treeview";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { NgxPrintModule } from "ngx-print";
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DatePipe } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from "./guards/auth";
import { ModalVerComponent } from './components/modal-ver/modal-ver.component';
import { ModalTrazabilidadComponent } from './components/modal-trazabilidad/modal-trazabilidad.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ConvocatoriasComponent } from './pages/convocatorias/convocatorias.component';
import { ConvocatoriaComponent } from './pages/convocatoria/convocatoria.component';
import { ModalTdrComponent } from './components/modal-tdr/modal-tdr.component';
import { ModalCronogramaComponent } from './components/modal-cronograma/modal-cronograma.component';
import { ModalAnexoComponent } from './components/modal-anexo/modal-anexo.component';
import { ModalComunicadosComponent } from './components/modal-comunicados/modal-comunicados.component';
import { ModalResultadosComponent } from './components/modal-resultados/modal-resultados.component';
import { ModalAnularComponent } from './components/modal-anular/modal-anular.component';
import { ModalCerrarComponent } from './components/modal-cerrar/modal-cerrar.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MenuComponent,
    LoginComponent,
    DashboardComponent,
    ModalVerComponent,
    ModalTrazabilidadComponent,
    ConvocatoriasComponent,
    ConvocatoriaComponent,
    ModalTdrComponent,
    ModalCronogramaComponent,
    ModalAnexoComponent,
    ModalComunicadosComponent,
    ModalResultadosComponent,
    ModalAnularComponent,
    ModalCerrarComponent
  ],
  imports: [
    BrowserModule,
    HighchartsChartModule,
    DataTablesModule,
    HttpClientModule,
    ReactiveFormsModule,
    QuillModule,
    GooglePlaceModule,
    NgxPrintModule,
    NgxDropzoneModule,
    TreeviewModule.forRoot(),
    ModalModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: "",
      libraries: ["places"],
    }),
    RouterModule.forRoot(ROUTES, { useHash: false }),
    NgSelectModule,
    FormsModule
  ],
  providers: [
    NgSelectConfig,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-PE'
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
