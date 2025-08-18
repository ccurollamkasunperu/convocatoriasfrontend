import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { AuthGuard } from "./guards/auth.guard";
import { NoAuthGuard } from "./guards/no-auth.guard";
import { ConvocatoriaComponent } from "./pages/convocatoria/convocatoria.component";
import { ConvocatoriasComponent } from "./pages/convocatorias/convocatorias.component";

export const ROUTES: Routes = [
  { path: "dashboard", component: DashboardComponent , canActivate: [AuthGuard]},
  
  { path: "convocatorias", component: ConvocatoriasComponent , canActivate: [AuthGuard]},
  { path: "nueva-convocatoria", component: ConvocatoriaComponent , canActivate: [AuthGuard]},
  { path: "editar-convocatoria/:id", component: ConvocatoriaComponent , canActivate: [AuthGuard]},

  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "**", pathMatch: "full", redirectTo: "login" },
  { path: "login", component: LoginComponent ,canActivate: [NoAuthGuard]}
];