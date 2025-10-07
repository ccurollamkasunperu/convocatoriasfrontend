import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-resultados',
  templateUrl: './modal-resultados.component.html',
  styleUrls: ['./modal-resultados.component.css']
})
export class ModalResultadosComponent implements OnInit {
  titulopant : string = "RESULTADOS DE CONVOCATORIA";
  cnv_id : string = '0';

  cnv_obsanu : string = '';
  dataTrazabilidad: any;
  
  showGuardararchivo:boolean=false;
  showArc:boolean=false;
  
  selectedFile: File | null = null;
  uploading = false;

  saferesUrl: SafeResourceUrl | null = null;

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
    if (this.convocatoria && this.convocatoria.cnv_filres != null) {
      url = String(this.convocatoria.cnv_filres).trim();
    }

    if (!url) {
      this.showGuardararchivo = true;
      this.showArc = false;
      return;
    }

    this.showGuardararchivo = false;
    this.showArc = true;

    var isPdf = /\.pdf(\?|$)/i.test(url);
    var embedUrl = isPdf
      ? url + '#toolbar=1&navpanes=0&scrollbar=1'
      : 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url);

    this.saferesUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  onFileSelected(e: any) {
    var files = e && e.target ? e.target.files : null;
    this.selectedFile = (files && files.length > 0) ? files[0] : null;
  }

  cancelar() {
    this.cancelClicked.emit();
  }

  GuardarArchivores() {
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
      html: '¿Seguro de registrar el Resultado?',
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
      this.api.getconvocatoriaresreg(formData).subscribe({
        next: (data: any) => {
          this.uploading = false;
          var row = Array.isArray(data) ? data[0] : (data && data[0] ? data[0] : data);
          console.log(data);
          var error = row && row.error != null ? Number(row.error) : -1;
          var mensa = row && row.mensa ? String(row.mensa) : '';
          if(error == 0){
            Swal.fire({
              title: 'Exito',
              html: mensa || 'Resultado registrado correctamente.',
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
        },
        error: (err) => {
          if (err && err.status === 401) return;
          this.uploading = false;
          Swal.fire('Error', 'No se pudo registrar el Resultado', 'error');
          console.error(err);
        },
      });
    });
  }
  
  Anular() {
    this.mostrarObservacionPrompt('');
  }

  private mostrarObservacionPrompt(valorInicial: string) {
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
        html: '¿Seguro de <b>ANULAR RESULTADOS</b>?',
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
          // Reabrir el input con lo que ya escribió
          this.mostrarObservacionPrompt(observacion);
          return;
        }

        var dataPost = {
          p_cnv_id: String(this.convocatoria ? this.convocatoria.cnv_id : 0),
          p_cnv_usumov: String(localStorage.getItem('usuario') ? localStorage.getItem('usuario') : '0'),
          p_cnv_observ: observacion
        };

        this.api.getconvocatoriaresanu(dataPost).subscribe(
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
                  setTimeout(() => this.cancelClicked.emit(), 300);
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

}
