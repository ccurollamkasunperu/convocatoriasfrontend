import { Component, Input, Output, EventEmitter,OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modal-cerrar',
  templateUrl: './modal-cerrar.component.html',
  styleUrls: ['./modal-cerrar.component.css']
})
export class ModalCerrarComponent implements OnInit {
  titulopant : string = "CERRAR CONVOCATORIA";
  cnv_id : string = '0';
  cnv_obsanu : string = '';
  
  @Input() convocatoria: any;

  @Output() cancelClicked = new EventEmitter<void>(); 
  
  constructor(
    private api: ApiService,
    private appComponent: AppComponent
  ) {
    this.appComponent.login = false;
  }

  ngOnInit() {
    console.log(this.convocatoria);
    this.cnv_id=this.convocatoria.cnv_id;
  }

  cancelar() {
    this.cancelClicked.emit();
  }

  ProcesarRegistro() {
    const dataPost = {
      p_cnv_id:(this.cnv_id == null || this.cnv_id === '') ? 0 : parseInt(this.cnv_id),
      p_cnv_observ:this.cnv_obsanu,
      p_usu_id:parseInt(localStorage.getItem("usuario"))
    };

    Swal.fire({
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
        this.api.getconvocatoriacer(dataPost).subscribe((data: any) => {
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
                  this.cancelClicked.emit();
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
    })
  }
}
