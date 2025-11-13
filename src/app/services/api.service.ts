import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private httpClient: HttpClient, private router: Router) { }

  // URL base de la API (definida en los environments, cambia la IP ahí)
  urlApi: string = environment.apiUrl;
  urlApiAuth: string = environment.apiUrl;
  //urlApiAuth: string = "http://127.0.0.1:8000/api/";

  getQuery(query: string) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.get(url);
  }

  postQuery(query: string, params: any) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.post(url, params);
  }

  AuthpostQuery(query: string, params: any) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.post(url, params);
  }

  //END POINTS NUEVOS PARA USAR
  
  getIniciarSesion(data: object) {
    return this.AuthpostQuery("login", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getDatosUsuario(data: object) {
    return this.postQuery("me", data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  isLogged() {
    let user_sess = localStorage.getItem("usu_id");
    return user_sess != null ? true : false;
  }

  validateSession(ruta: string) {
    if (this.isLogged()) {
      if (ruta == "login") {
        this.router.navigate(["login"]);
      } else {
        this.router.navigate([ruta]);
      }
    } else {
      this.router.navigate(["login"]);
    }
  }

//NUEVOS ENDPOINT
  getusuariocambiocontrasena(data: object) {
    return this.postQuery("seguridad/cambiarclave", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getSeguridadpermisoobjetosel(data: object) {
    return this.postQuery("seguridad/permisoobjetosel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getSeguridadperfilusuarioapp(data: object) {
    return this.postQuery("seguridad/perfilusuarioapp", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  gettrazabilidadsel(data: object) {
    return this.postQuery("convocatoria/trazabilidadsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettrazabilidadreg(data: object) {
    return this.postQuery("convocatoria/trazabilidadreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getestadossel(data: object) {
    return this.postQuery("convocatoria/estadossel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getresponsablesel(data: object) {
    return this.postQuery("convocatoria/responsablesel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriatdrreg(data: object) {
    return this.postQuery("convocatoria/convocatoriatdrreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriatdranu(data: object) {
    return this.postQuery("convocatoria/convocatoriatdranu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getconvocatoriaanxreg(data: object) {
    return this.postQuery("convocatoria/convocatoriaanxreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriaanxanu(data: object) {
    return this.postQuery("convocatoria/convocatoriaanxanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getconvocatoriacomreg(data: object) {
    return this.postQuery("convocatoria/convocatoriacomreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacomanu(data: object) {
    return this.postQuery("convocatoria/convocatoriacomanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getconvocatoriaresreg(data: object) {
    return this.postQuery("convocatoria/convocatoriaresreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriaresanu(data: object) {
    return this.postQuery("convocatoria/convocatoriaresanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  getconvocatoriacroreg(data: object) {
    return this.postQuery("convocatoria/convocatoriacroreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacroanu(data: object) {
    return this.postQuery("convocatoria/convocatoriacroanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriasel(data: object) {
    return this.postQuery("convocatoria/convocatoriasel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriares(data: object) {
    return this.postQuery("convocatoria/convocatoriares", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriagra(data: object) {
    return this.postQuery("convocatoria/convocatoriagra", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacrg(data: object) {
    return this.postQuery("convocatoria/convocatoriacrg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacom(data: object) {
    return this.postQuery("convocatoria/convocatoriacom", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacomunicadosel(data: object) {
    return this.postQuery("convocatoria/convocatoriacomunicadosel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriaanx(data: object) {
    return this.postQuery("convocatoria/convocatoriaanx", data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getareadenominacionsel(data: object) {
    return this.postQuery("convocatoria/areadenominacionsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriacer(data: object) {
    return this.postQuery("convocatoria/convocatoriacer", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriapub(data: object) {
    return this.postQuery("convocatoria/convocatoriapub", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconvocatoriaanu(data: object) {
    return this.postQuery("convocatoria/convocatoriaanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettipoconvocatoriasel(data: object) {
    return this.postQuery("convocatoria/tipoconvocatoriasel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
    
  getFileBase64ByPath(data: object) {
    return this.postQuery('files/base64-from-path', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
}
