import { Component, Input, Output, EventEmitter,OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-ver',
  templateUrl: './modal-ver.component.html',
  styleUrls: ['./modal-ver.component.css']
})
export class ModalVerComponent implements OnInit {
  blobUrl: string | null = null;
  
  titulopant : string = "VISUALIZAR CONVOCATORIA";
  cnv_id : string = '0';
  
  dataArchivos: any[] = [];

  @ViewChild('previewTpl', { static: false }) previewTpl!: TemplateRef<any>;
  modalRefPreview?: BsModalRef;

  previewName = '';
  previewMime = '';
  previewSrc: SafeResourceUrl | null = null;
  isPdf = false;
  
  modalRef?: BsModalRef;
  
  @Input() convocatoria: any;
  
  @Output() cancelClicked = new EventEmitter<void>(); 
  
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private api: ApiService,
    private appComponent: AppComponent
  ) {
    this.appComponent.login = false;
  }

  ngOnInit() {
    console.log(this.convocatoria);
    this.cnv_id = this.convocatoria.cnv_id;
  }

  cancelar() {
    this.cancelClicked.emit();
  }

}
