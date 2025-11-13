import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-comunicados',
  templateUrl: './modal-comunicados.component.html',
  styleUrls: ['./modal-comunicados.component.css']
})
export class ModalComunicadosComponent implements OnInit {
  titulopant : string = "COMUNICADO CONVOCATORIA";
  cnv_id : string = '0';

  cnv_obsanu : string = '';
  dataComunicados: any;
  
  showGuardararchivo:boolean=true;
  showArc:boolean=false;
  
  selectedFile: File | null = null;
  uploading = false;

  safecomUrl: SafeResourceUrl | null = null;
  private filesBase = '';
  
  viewerRawUrl: string = '';
  visorModal: any = null;
  cncIdSeleccionado: number = 0;

  @Input() convocatoria: any;

  @Output() cancelClicked = new EventEmitter<void>(); 
  
  constructor(
    private api: ApiService,
    private appComponent: AppComponent,
    private sanitizer: DomSanitizer
  ) {
    this.appComponent.login = false;
  }

  ngOnInit() {
    let url = '';
    if (this.convocatoria && this.convocatoria.cnv_filcom != null) {
      url = String(this.convocatoria.cnv_filcom).trim();
    }
    this.getconvocatoriacomunicadosel();
  }

  getconvocatoriacomunicadosel(){
    const data_post = {
      p_cnv_id: parseInt(this.convocatoria.cnv_id),
      p_cnc_activo: 1
    };

    this.api.getconvocatoriacomunicadosel(data_post).subscribe((data: any) => {
      this.dataComunicados = data;
    });
  }

  private buildFileUrl(ruta: string): string {
    if (!ruta) return '';
    var r = String(ruta).trim();
    if (/^https?:\/\//i.test(r)) return r;
    var base = String(this.filesBase || '').replace(/\/+$/,'');
    var rel  = r.replace(/^\/+/, '');
    var url  = base ? (base + '/' + rel) : ('/' + rel);
    return encodeURI(url);
  }

  VerArchivo(ruta: string): void {
    if (!ruta) {
      Swal.fire({ title: 'Aviso', text: 'No se encontró la ruta del archivo.', icon: 'warning' });
      return;
    }
    var url = String(ruta).trim();
    if (/^https?:\/(?!\/)/i.test(url)) {
      url = url.replace(/^https?:\//i, function (m) { return m + '/'; });
    }
    if (/^www\./i.test(url)) {
      url = 'https://' + url;
    }
    url = url.replace(/^http:\/\//i, 'https://');
    url = encodeURI(url);
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }


  onFileSelected(e: any) {
    var files = e && e.target ? e.target.files : null;
    this.selectedFile = (files && files.length > 0) ? files[0] : null;
  }

  cancelar() {
    this.cancelClicked.emit();
  }

  GuardarArchivocom() {
    if (!this.selectedFile) {
      Swal.fire('Archivo requerido', 'Selecciona un archivo .pdf/.doc/.docx', 'warning');
      return;
    }

    var name = this.selectedFile.name || '';
    var parts = name.split('.');
    var ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';

    var allowed = ['pdf', 'doc', 'docx'];
    if (allowed.indexOf(ext) === -1) {
      Swal.fire('Formato no permitido', 'Solo se aceptan PDF, DOC o DOCX.', 'error');
      return;
    }

    Swal.fire({
      title: 'Mensaje',
      html: '¿Seguro de registrar el Comunicado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.uploading = true;
      var formData = new FormData();
      formData.append('p_cnv_id', String(this.convocatoria ? this.convocatoria.cnv_id : 0));
      formData.append('p_cnv_usumov',String(localStorage.getItem('usuario') ? localStorage.getItem('usuario') : '0'));
      formData.append('p_cnv_filext', ext);
      formData.append('file', this.selectedFile);
      this.api.getconvocatoriacomreg(formData).subscribe({
        next: (data: any) => {
          this.uploading = false;
          var row = Array.isArray(data) ? data[0] : (data && data[0] ? data[0] : data);
          console.log(data);
          var error = row && row.error != null ? Number(row.error) : -1;
          var mensa = row && row.mensa ? String(row.mensa) : '';
          if(error == 0){
            Swal.fire({
              title: 'Exito',
              html: mensa || 'Comunicado registrado correctamente.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar',
            }).then((result) => {
              if (result.value) {
                setTimeout(() => {
                  (<HTMLInputElement>document.getElementById('comunicadoinputfile')).value = "";
                  this.getconvocatoriacomunicadosel()
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
        },
        error: (err) => {
          if (err && err.status === 401) return;
          this.uploading = false;
          Swal.fire('Error', 'No se pudo registrar el Comunicado', 'error');
          console.error(err);
        },
      });
    });
  }
  
  Anular(cnc_id?: number) {
    this.mostrarObservacionPromptCom('', cnc_id || this.cncIdSeleccionado || 0);
  }

  private mostrarObservacionPromptCom(valorInicial: string,cnc_id: number = 0) {
    Swal.fire({
      title: '<b>OBSERVACIÓN</b>',
      text: 'Ingrese el motivo o comentario',
      input: 'textarea',
      inputValue: valorInicial,
      inputPlaceholder: 'Ej.: Anulación por ...',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'CONTINUAR',
      cancelButtonText: 'CANCELAR',
      allowOutsideClick: false,
      allowEscapeKey: false,
      inputValidator: (value: string) => {
        if (!value || !String(value).trim()) {
          return 'La observación es obligatoria';
        }
        return undefined as any;
      }
    }).then((inputResult: any) => {
      if (!inputResult.isConfirmed) return;

      var observacion = String(inputResult.value || '').trim();

      Swal.fire({
        title: 'Mensaje',
        html: '¿Seguro de <b>ANULAR COMUNICADO</b>?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ACEPTAR',
        cancelButtonText: 'CANCELAR',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((confirmRes: any) => {
        if (!confirmRes.isConfirmed) {
          this.mostrarObservacionPromptCom(observacion);
          return;
        }

        var dataPost = {
          p_cnc_id: cnc_id,
          p_cnv_usumov: String(localStorage.getItem('usuario') ? localStorage.getItem('usuario') : '0'),
          p_cnv_observ: observacion
        };

        this.api.getconvocatoriacomanu(dataPost).subscribe(
          (data: any) => {
            var ok = data && data[0] && data[0].error == 0;
            var mensa = (data && data[0] && data[0].mensa) ? String(data[0].mensa).trim() : '';

            if (ok) {
              Swal.fire({
                title: 'Éxito',
                html: mensa || 'Operación exitosa.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              }).then((r: any) => {
                if (r && r.value) {
                  setTimeout(() => this.getconvocatoriacomunicadosel(), 300);
                }
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: mensa || 'Ocurrió un error en la operación.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              });
            }
          },
          (err: any) => {
            if (err && err.status === 401) return;
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un problema al procesar la solicitud.',
              icon: 'error',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            });
            console.error(err);
          }
        );
      });
    });
  }

  private normalizeAndFixUrl(ruta: string): string {
    if (!ruta) return '';
    var url = String(ruta).trim();
    if (/^https?:\/(?!\/)/i.test(url)) {
      url = url.replace(/^https?:\//i, function (m) { return m + '/'; });
    }
    if (/^www\./i.test(url)) {
      url = 'https://' + url;
    }
    url = url.replace(/^http:\/\//i, 'https://');
    url = encodeURI(url);
    return url;
  }

  private getExtFromUrl(url: string): string {
    var s = String(url || '');
    s = s.split('#')[0];
    s = s.split('?')[0];
    var last = s.split('/').pop() || '';
    var parts = last.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  AbrirVisorComunicado(ruta: string, cnc_id: number): void {
    if (!ruta) {
      Swal.fire({ title: 'Aviso', text: 'No se encontró la ruta del archivo.', icon: 'warning' });
      return;
    }

    var fixedUrl = this.normalizeAndFixUrl(ruta);
    var ext = this.getExtFromUrl(fixedUrl);

    this.viewerRawUrl = fixedUrl;
    this.cncIdSeleccionado = cnc_id;

    if (ext === 'pdf') {
      this.safecomUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fixedUrl);
    } else {
      var gview = 'https://docs.google.com/gview?embedded=1&url=' + encodeURIComponent(fixedUrl);
      this.safecomUrl = this.sanitizer.bypassSecurityTrustResourceUrl(gview);
    }

    var el = document.getElementById('modalVisorComunicado');
    if (el) {
      this.visorModal = bootstrap.Modal.getOrCreateInstance(el);
      this.visorModal.show();
    }
  }

  cerrarVisor(): void {
    if (this.visorModal) {
      this.visorModal.hide();
    }
    this.safecomUrl = null;
    this.viewerRawUrl = '';
    this.cncIdSeleccionado = 0;
  }

  AnularDesdeVisor(): void {
    if (this.visorModal) {
      this.visorModal.hide();
    }
    this.mostrarObservacionPromptCom('', this.cncIdSeleccionado);
  }
}
