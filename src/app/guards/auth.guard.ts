import { Injectable } from '@angular/core';
import {CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot,UrlTree,Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const usu_apepat = localStorage.getItem('usu_apepat');
    const usu_apemat = localStorage.getItem('usu_apemat');
    const usu_nombre = localStorage.getItem('usu_nombre');

    if (token && usu_apepat && usu_apemat && usu_nombre) {
      return true;
    } else {
      console.warn('Bloqueado por AuthGuard: no hay token');
      return this.router.createUrlTree(['/login']);
    }
  }
}
