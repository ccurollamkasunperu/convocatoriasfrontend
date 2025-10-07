import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "../../app.component";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  txtlogspinner : string = "";
  inputUsuario: string = "";
  inputPassword: string = "";
  sessionMsg: string = "";
  ip: string = "";

  loging: string = "";
  passwd: string = "";

  loading: boolean = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private appComponent: AppComponent
  ) {
    this.appComponent.login = true;
  }

  ngOnInit() {
    this.api.validateSession("login");
  }

  IniciarSesion() {
    this.loading = true;

    const data_post = {
      p_loging: this.loging,
      p_passwd: this.passwd
    };

    this.api.getIniciarSesion(data_post).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        // Guardar expiración del token si el backend la provee (token_exp) o si podemos extraerla del JWT
        try {
          let tokenExp: number | null = null;
          if (res && (res.token_exp || res.exp || res.expires_at)) {
            // Aceptar varias claves posibles que el backend pueda enviar
            const candidate = res.token_exp || res.exp || res.expires_at;
            const n = Number(candidate);
            if (!isNaN(n)) {
              // Si viene en milisegundos (valor muy grande), convertir a segundos
              tokenExp = n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
            } else {
              const parsed = Date.parse(String(candidate));
              if (!isNaN(parsed)) tokenExp = Math.floor(parsed / 1000);
            }
          }

          // Si no vino expiration explícita, intentar decodificar token JWT y leer 'exp'
          if (!tokenExp && res && res.token) {
            const parts = String(res.token).split('.');
            if (parts.length >= 2) {
              const payload = parts[1];
              const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
              const pad = base64.length % 4;
              const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
              const json = atob(padded);
              const obj = JSON.parse(json);
              if (obj && obj.exp) tokenExp = Number(obj.exp);
            }
          }

          if (tokenExp && !isNaN(tokenExp)) {
            localStorage.setItem('token_exp', String(tokenExp));
          }
        } catch (e) {
          // No hacer nada si no se puede parsear; no queremos bloquear el login por esto
          console.warn('No se pudo determinar token_exp:', e);
        }
        localStorage.setItem('usuario', res.user.id);

        const datausuario = {
          p_usu_id: res.user.id,
          p_usu_apepat: '',
          p_usu_apemat: '',
          p_usu_nombre: '',
          p_usu_loging: '',
          p_usu_chkadm: 9,
          p_usu_activo: 9
        };

        this.api.getDatosUsuario(datausuario).subscribe({
          next: (datos: any) => {
            this.txtlogspinner = "Cargando datos del usuario...";
            if (!datos || !datos.length) {
              this.loading = false;
              swal.fire('Error', 'No se encontraron datos del usuario', 'error');
              return;
            }
            const ageId = (datos && datos.length && datos[0] && datos[0].age_id != null) ? datos[0].age_id : 0;
            localStorage.setItem('age_id', String(ageId));

            localStorage.setItem('usu_apepat', datos[0].usu_apepat);
            localStorage.setItem('usu_apemat', datos[0].usu_apemat);
            localStorage.setItem('usu_nombre', datos[0].usu_nombre);
            localStorage.setItem('usu_nomcom', datos[0].usu_nomcom);
            localStorage.setItem('equ_id', datos[0].equ_id);
            localStorage.setItem('usu_correo', datos[0].usu_correo);
            localStorage.setItem('usu_chkadm', datos[0].usu_chkadm);
            localStorage.setItem('age_chkall', datos[0].age_chkall);
            
            const dataMenu = {
              p_usu_id: res.user.id,
            };

            this.api.getSeguridadpermisoobjetosel(dataMenu).subscribe({
              next: (datosMenu: any) => {
                localStorage.setItem('objetosMenu', JSON.stringify(datosMenu));
                this.loading = false;
                this.router.navigate(['/convocatorias']);
              },
              error: (err) => {
                this.loading = false;
                swal.fire('Error', 'No se pudo cargar el menú', 'error');
              }
            });
          },
          error: (err) => {
            this.loading = false;
            const mensajeError = (err && err.error && err.error.mensaje) ? err.error.mensaje : 'Error al obtener los datos del usuario';
            swal.fire('Error', mensajeError, 'error');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        const mensajeError = (err && err.error && err.error.mensaje) ? err.error.mensaje : 'Error de autenticación';
        swal.fire('Error', mensajeError, 'error');
      }
    });
  }

}
