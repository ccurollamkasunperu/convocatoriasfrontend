import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import Swal from "sweetalert2";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styles: [],
})
export class NavbarComponent implements OnInit {
  usu_apemat: string = "";
  usu_apepat: string = "";
  usu_id: string = "";
  usu_loging: string = "";
  usu_nombre: string = "";
  usu_nomcom: string = "";
  eqc_id: string = "";
  eqt_id: string = "";

  contrasena:string="";
  modalRef: BsModalRef | undefined;

  // Campos del modal
  contrasenaAnterior: string = "";
  contrasenaNueva: string = "";
  contrasena2: string = "";
  verPassAnt: boolean = false;
  verPassNueva: boolean = false;
  verPassConf: boolean = false;
  errorForm: string = "";

  @ViewChild('tplCambiarContrasena', { static: false })
  tplCambiarContrasena!: TemplateRef<any>;

  constructor(private router: Router,private modalService: BsModalService,private api: ApiService) {}

  ngOnInit() {
    this.getdataUsuario();
  }

  getdataUsuario() {
    this.usu_apepat = sessionStorage.getItem("usu_apepat");
    this.usu_apemat = sessionStorage.getItem("usu_apemat");
    this.usu_nombre = sessionStorage.getItem("usu_nombre");
    this.usu_nomcom = sessionStorage.getItem("usu_nomcom");
    this.eqc_id = sessionStorage.getItem("eqc_id");
    this.eqt_id = sessionStorage.getItem("eqt_id");
  }

  delDatosSession() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('usu_apepat');
    sessionStorage.removeItem('usu_apemat');
    sessionStorage.removeItem('usu_nombre');
    sessionStorage.removeItem('usu_nomcom');
    sessionStorage.removeItem('eqc_id');
    sessionStorage.removeItem('eqt_id');

    sessionStorage.clear();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }

  openModalShow(template: TemplateRef<any>, clase: string) {
    this.modalRef = this.modalService.show(template, {class: clase});
  }

  LimpiarFormulario() {

  }

  // Abrir modal
  CambiarContrasena() {
    this.contrasenaAnterior = "";
    this.contrasenaNueva = "";
    this.contrasena2 = "";
    this.verPassAnt = false;
    this.verPassNueva = false;
    this.verPassConf = false;
    this.errorForm = "";
    this.modalRef = this.modalService.show(this.tplCambiarContrasena, {
      class: 'modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  closeModal() {
    if (this.modalRef) { this.modalRef.hide(); }
  }

  private validarFormulario(): boolean {
    if (!this.contrasenaAnterior || !this.contrasenaNueva || !this.contrasena2) {
      this.errorForm = "Debe completar todos los campos.";
      return false;
    }
    if (this.contrasenaNueva.length < 8) {
      this.errorForm = "La nueva contraseña debe tener al menos 8 caracteres.";
      return false;
    }
    if (this.contrasenaNueva === this.contrasenaAnterior) {
      this.errorForm = "La nueva contraseña no puede ser igual a la anterior.";
      return false;
    }
    if (this.contrasenaNueva !== this.contrasena2) {
      this.errorForm = "Las contraseñas no coinciden.";
      return false;
    }
    this.errorForm = "";
    return true;
  }

  procesaRegistro() {
    if (!this.validarFormulario()) return;

    const usuIdStr = sessionStorage.getItem('usuario') || '';

    const dataPost = {
      p_usu_id: usuIdStr,
      p_usu_pasold: this.contrasenaAnterior,
      p_usu_pasnew: this.contrasenaNueva
    };

    Swal.fire({
      title: 'Mensaje',
      html: "¿Seguro de guardar datos?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR'
    }).then((result) => {
      if (result.isConfirmed) {
          this.api.getusuariocambiocontrasena(dataPost).subscribe((data: any) => {
            if(data[0].error == 0){
              Swal.fire({
                title: 'Exito',
                html: data[0].mensa.trim(),
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
              }).then((result) => {
                if (result.value) {
                  setTimeout(() => {
                    this.closeModal();
                  }, 300);
                }
              });
            }else{
              Swal.fire({
                  title: 'Error',
                  text: data[0].mensa.trim(),
                  icon: 'error',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar',
                });
            }
          });
        }
    });
  }

}
