import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');

    // Antes de enviar la petición, validamos si existe y si el token no está expirado.
    // Si estamos en la ruta de login, permitimos la petición (por ejemplo, validateSession desde el login).
    if ((!token || this.isTokenExpired(token)) && this.router.url !== '/login') {
      // Limpieza local
      sessionStorage.clear();

      // Mostrar modal de sesión expirada y redirigir al login
      this.showSessionExpired();

      // Cancelar la petición devolviendo un error 401 para que los suscriptores manejen el caso si lo desean.
      const resp = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: req.url,
        error: { message: 'Token expired or missing' }
      });

      return throwError(resp);
    }

    const clonedReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })
      : req;

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.router.url !== '/login') {
          sessionStorage.clear();

          swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        }

        return throwError(error);
      })
    );
  }

  // Muestra el modal de sesión expirada (centralizado)
  private showSessionExpired() {
    swal.fire({
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  // Intentamos decodificar JWT y comprobar la propiedad 'exp' (tiempo en segundos desde epoch).
  // Si el token no es JWT o no contiene 'exp', conservamos la lógica de permitir la petición
  // (porque no podemos saber la expiración localmente).
  private isTokenExpired(token: string): boolean {
    try {
      // Primero, preferir una expiración explícita guardada en localStorage
      const stored = this.getStoredTokenExp();
      const now = Math.floor(Date.now() / 1000);
      if (stored && !isNaN(stored)) {
        // Considerar un pequeño buffer de seguridad (5 segundos)
        return Number(stored) <= (now + 5);
      }

      // Si no hay expiración guardada, intentar decodificar el JWT y leer 'exp'
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        // No es posible validar expiración localmente
        return false;
      }

      // Considerar un pequeño buffer de seguridad (5 segundos)
      return Number(payload.exp) <= (now + 5);
    } catch (e) {
      // Si algo falla al decodificar, no asumimos expirado para no bloquear peticiones legítimas.
      return false;
    }
  }

  // Lee token_exp en segundos desde localStorage si existe
  private getStoredTokenExp(): number | null {
    try {
      const te = sessionStorage.getItem('token_exp');
      if (!te) return null;
      const n = Number(te);
      return isNaN(n) ? null : n;
    } catch (e) {
      return null;
    }
  }

  // Decodifica el payload de un JWT (sin verificar firma)
  private decodeToken(token: string): any | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // Base64Url -> Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    return JSON.parse(json);
  }
}
