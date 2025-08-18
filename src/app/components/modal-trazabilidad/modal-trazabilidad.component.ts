import { Component, Input, Output, EventEmitter,OnInit } from '@angular/core';

import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-trazabilidad',
  templateUrl: './modal-trazabilidad.component.html',
  styleUrls: ['./modal-trazabilidad.component.css']
})
export class ModalTrazabilidadComponent implements OnInit {
  titulopant : string = "TRAZABILIDAD CONVOCATORIA";
  cnv_id : string = '0';
  cnv_feccnv : string = '';
  cnv_horcnv : string = '';
  cnv_numero : string = '';

  cnv_obsanu : string = '';
  dataTrazabilidad: any;
  
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
    this.loadTrazabilidad();
    this.cnv_numero=this.convocatoria.cnv_numero;
    this.cnv_feccnv=this.convocatoria.cnv_feccnv;
    this.cnv_horcnv=this.convocatoria.cnv_horcnv;
  }

  cancelar() {
    this.cancelClicked.emit();
  }

  loadTrazabilidad() {
    const data_post = {
      p_trz_id: 0,
      p_cnv_id: this.cnv_id,
      p_trz_activo: 1
    };

    this.api.gettrazabilidadsel(data_post).subscribe((data: any) => {
      this.dataTrazabilidad = data;
    });
  }
}