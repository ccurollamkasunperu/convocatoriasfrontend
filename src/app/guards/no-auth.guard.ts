import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('token');
    const usu_apepat = sessionStorage.getItem('usu_apepat');
    const usu_apemat = sessionStorage.getItem('usu_apemat');
    const usu_nombre = sessionStorage.getItem('usu_nombre');

    if (token && usu_apepat && usu_apemat && usu_nombre) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}