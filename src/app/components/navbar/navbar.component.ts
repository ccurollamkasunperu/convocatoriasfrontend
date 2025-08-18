import { Component, OnInit,TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import swal from "sweetalert2";

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

  modalRef: BsModalRef;
  contrasena:string="";

  constructor(private router: Router,private modalService: BsModalService,private api: ApiService) {}

  ngOnInit() {
    this.getdataUsuario();
  }

  getdataUsuario() {
    this.usu_apepat = localStorage.getItem("usu_apepat");
    this.usu_apemat = localStorage.getItem("usu_apemat");
    this.usu_nombre = localStorage.getItem("usu_nombre");
    this.usu_nomcom = localStorage.getItem("usu_nomcom");
    this.eqc_id = localStorage.getItem("eqc_id");
    this.eqt_id = localStorage.getItem("eqt_id");
  }

  delDatosSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usu_apepat');
    localStorage.removeItem('usu_apemat');
    localStorage.removeItem('usu_nombre');
    localStorage.removeItem('usu_nomcom');
    localStorage.removeItem('eqc_id');
    localStorage.removeItem('eqt_id');

    localStorage.clear();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }

  openModalShow(template: TemplateRef<any>, clase: string) {
    this.modalRef = this.modalService.show(template, {class: clase});
  }

  LimpiarFormulario() {

  }

  procesaRegistro(){
    if(this.contrasena == ''){
      swal.fire({
        title: 'Error',
        text: 'Debe ingresar una Contraseña a cambiar',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
      });
    }
    else{
      const dataPost = {
        p_usu_id : parseInt(localStorage.usu_id),
        p_usu_passwd : this.contrasena
      };

      swal.fire({
        title: 'Mensaje',
        html: "¿Seguro de Guardar Datos?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ACEPTAR',
        cancelButtonText: 'CANCELAR'
      }).then((result) => {
        if (result.isConfirmed) {
          /* this.api.getusuariocambiocontrasena(dataPost).subscribe((data: any) => {
            if(data[0].error == 0){
              swal.fire({
                title: 'Exito',
                text: data[0].mensa.trim(),
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
              }).then((result) => {
                if (result.value) {
                  setTimeout(() => {
                    document.getElementById('closeModal').click();
                  }, 300);
                }
              });
            }else{
              swal.fire({
                  title: 'Error',
                  text: data[0].mensa.trim(),
                  icon: 'error',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar',
                });
            }
          }); */

        }
      })
    }
  }

}
