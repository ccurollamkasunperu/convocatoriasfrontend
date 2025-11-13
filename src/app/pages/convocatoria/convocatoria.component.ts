import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import swal from "sweetalert2";
import { finalize } from 'rxjs/operators';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxDropzoneComponent } from 'ngx-dropzone';

type ExistingFile = {
  arc_id: number;
  name: string;
  type: string;
  path: string;
  isRemote: true;
};

@Component({
  selector: 'app-convocatoria',
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.css']
})
export class ConvocatoriaComponent implements OnInit {
  titulopant : string = "Registro | Edición de Convocatoria";
  txtbtn : string = "";
  icono : string = "pe-7s-next-2";
  loading: boolean = false;
  files: File[] = [];
  existingFiles: ExistingFile[] = [];
  demoMode = true;

  readonly MAX_FILES = 5;

  @ViewChild(NgxDropzoneComponent, { static: false }) dz!: NgxDropzoneComponent;
  
  @ViewChild('previewTpl', { static: false }) previewTpl: TemplateRef<any>;
  modalRefPreview: BsModalRef = null;
  previewSrc: SafeResourceUrl = null;
  previewName = '';
  previewMime = '';
  isPdf = false;

  inputsDisabled = false;

  dataArea:any;
  dataResponsable:any;
  dataTipoConvocatoria:any;

  cnv_id:string='';
  usu_id:string='';
  cnv_numero:string='';
  cnv_feccnv:string='';
  res_id:string='0';

  cnv_import:string='0';
  cnv_numexp:string='';

  cnv_descri:string='';
  cnv_observ:string='';

  cnv_fhoini:string='';
  cnv_fhofin:string='';

  ard_id:string='0';
  tic_id:Number;

  constructor(
    private router: Router,
    private api: ApiService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {
    this.loading = true;
    this.loadArea();
    this.loadResponsable();
    this.loadTipoConvocatoria();
    if (this.demoMode) {
      this.preloadDemoFiles();
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cnv_id = id;
        this.loadData();        // EDITAR
        this.txtbtn = "Actualizar Convocatoria";
        this.inputsDisabled = true;
      } else {
        this.cnv_id = '0';      // NUEVO
        this.loading = false;
        this.files = [];
        this.existingFiles = [];
        this.txtbtn = "Crear Convocatoria";

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = (today.getMonth() + 1).toString().padStart(2, '0');
        const dd = today.getDate().toString().padStart(2, '0');
        this.cnv_feccnv = `${yyyy}-${mm}-${dd}`;
        
      }
    });
  }

  get totalFiles(): number {
    return (this.existingFiles.length || 0) + (this.files.length || 0);
  }
  
  loadArea() {
    const data_post = {
      p_ard_id : (this.ard_id == null || this.ard_id === '') ? 0 : parseInt(this.ard_id),
      p_acl_id : 0,
      p_arj_id : 0,
      p_atd_id : 0,
      p_ard_activo : 1
    };

    this.api.getareadenominacionsel(data_post).subscribe((data: any) => {
      this.dataArea = data;
    });
  }
  
  loadResponsable() {
    const data_post = {
      p_res_id : 0,
      p_usu_id : 0,
      p_res_apepat : '',
      p_res_apemat : '',
      p_res_nombre : '',
      p_res_activo : 1
    };

    this.api.getresponsablesel(data_post).subscribe((data: any) => {
      this.dataResponsable = data;
    });
  }
  
  loadTipoConvocatoria() {
    const data_post = {
      p_tic_id: 0,
      p_tic_activo: 1
    };

    this.api.gettipoconvocatoriasel(data_post).subscribe((data: any) => {
      this.dataTipoConvocatoria = data;
      this.tic_id=2;
    });
  }

  loadData() {
    this.loading = true;

    const data_post = {
      p_cnv_id:     this.cnv_id,
      p_cnv_numero: 0,
      p_est_id:     0,
      p_usu_id:     0,
      p_ard_id:     0,
      p_tic_id:     0,
      p_cnv_fecini: '',
      p_cnv_fecfin: '',
      p_cnv_activo: 9
    };

    this.api.getconvocatoriasel(data_post).pipe(finalize(() => this.loading = false)).subscribe((data: any) => {

      this.cnv_feccnv = data[0].cnv_feccnv;
      this.cnv_numero = data[0].cnv_numtab;
      this.cnv_descri = data[0].cnv_destab;
      this.ard_id     = data[0].ard_id;
      this.tic_id     = data[0].tic_id;
      this.cnv_observ = data[0].cnv_observ;
      this.cnv_fhofin = data[0].cnv_fhofin;
      this.cnv_fhoini = data[0].cnv_fhoini;
      this.res_id     = data[0].res_id;
      this.cnv_import = data[0].cnv_import;
      this.cnv_numexp = data[0].cnv_numexp;

    }, _ => {});
  }

  private openPreview(name: string, mime: string, dataUri: string) {
    this.previewName = name || 'archivo';
    this.previewMime = mime || '';
    this.isPdf = (this.previewMime.indexOf('pdf') !== -1);
    this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
    this.modalRefPreview = this.modalService.show(this.previewTpl, {
      class: 'modal-xl modal-dialog-centered'
    });
  }

  cerrarPreview() {
    if (this.modalRefPreview) {
      this.modalRefPreview.hide();
    }
  }

  onLabelClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dz.showFileSelector();
  }

  onAddClick(e: MouseEvent, dz: NgxDropzoneComponent) {
    e.preventDefault();
    e.stopPropagation();
    dz.showFileSelector();
  }

  verArchivoExisting(f: ExistingFile) {
    var ruta = (f.path || '').replace(/\\\\/g, '\\').replace(/\\/g, '/');

    this.api.getFileBase64ByPath({ ruta }).subscribe({
      next: (res: any) => {
        if (!res || !res.dataUri) { console.error('Respuesta inesperada', res); return; }
        var name = res.name || f.name || 'archivo';
        var mime = res.mime || '';
        if (!mime) {
          var byName = name.toLowerCase();
          if (byName.endsWith('.pdf')) mime = 'application/pdf';
          else if (byName.endsWith('.jpg') || byName.endsWith('.jpeg')) mime = 'image/jpeg';
          else if (byName.endsWith('.png')) mime = 'image/png';
        }
        var dataUri = String(res.dataUri);
        if (dataUri.indexOf('data:;base64,') === 0 && mime) {
          dataUri = 'data:' + mime + ';base64,' + dataUri.split(';base64,')[1];
        }
        var isPdf = (mime && mime.indexOf('pdf') !== -1) || name.toLowerCase().endsWith('.pdf');
        this.openPreview(name, mime, dataUri);
        this.isPdf = isPdf;
      },
      error: (err) => console.error('Error base64-from-path:', err)
    });
  }
  
  onImporteInput(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }
    const regex = /^(\d{0,8})(\.\d{0,2})?$/;
    if (!regex.test(value)) {
      value = value.substring(0, value.length - 1);
    }

    event.target.value = value;
    this.cnv_import = value;
  }

  onImporteBlur(event: any) {
    let value = event.target.value;
    if (!value) return;
    if (!value.includes('.')) {
      value = value + '.00';
    } else {
      const [ent, dec = ''] = value.split('.');
      if (dec.length === 0) value = `${ent}.00`;
      else if (dec.length === 1) value = `${ent}.${dec}0`;
    }
    event.target.value = value;
    this.cnv_import = value;
    this.cnv_import = this.cnv_import.replace(',', '.');
  }

  verArchivoNew(file: File) {
    var reader = new FileReader();
    reader.onload = () => {
      var dataUri = String(reader.result || '');
      var mime = file.type || (dataUri.indexOf(';base64,') > -1 ? dataUri.split(';base64,')[0].replace('data:', '') : '');
      this.openPreview(file.name, mime, dataUri);
    };
    reader.readAsDataURL(file);
  }

  mimeFromExt(filename: string): string {
    const extParts = (filename || '').split('.');
    const ext = extParts.length > 1 ? extParts.pop().toLowerCase() : '';
    const map: any = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf'
    };
    return map[ext] || 'application/octet-stream';
  }
  
  restrictNumeric(e) {
    let input;
    if (e.metaKey || e.ctrlKey) {
      return true;
    }
    if (e.which === 32) {
     return false;
    }
    if (e.which === 0) {
     return true;
    }
    if (e.which < 33) {
      return true;
    }
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
  }

  onSelect(event: any) {
    const allowed = ['image/jpeg','image/jpg','image/png','application/pdf'];
    const maxBytes = 5 * 1024 * 1024;

    const totalActual = this.files.length + this.existingFiles.length;
    const espacioRestante = this.MAX_FILES - totalActual;

    if (espacioRestante <= 0) {
      swal.fire('Límite alcanzado', `Solo se permite un máximo de ${this.MAX_FILES} archivos.`, 'warning');
      return;
    }

    const aAgregar: File[] = (event.addedFiles || []).slice(0, espacioRestante);

    let rechazados: string[] = [];
    for (const file of aAgregar) {
      if (!allowed.includes(file.type)) {
        rechazados.push(`${file.name} (tipo no permitido)`);
        continue;
      }
      if (file.size > maxBytes) {
        rechazados.push(`${file.name} (máx. 2MB)`);
        continue;
      }
      const exists = this.files.some(f => f.name===file.name && f.size===file.size && f.type===file.type);
      if (exists) continue;

      this.files.push(file);
    }

    const sobrantes = (event.addedFiles || []).length - aAgregar.length;
    if (sobrantes > 0) {
      rechazados.push(`${sobrantes} archivo(s) extra por encima del límite (${this.MAX_FILES}).`);
    }

    if (rechazados.length) {
      swal.fire('Algunos archivos no se agregaron', rechazados.join('<br>'), 'info');
    }
  }

  onRemove(file: File) {
    this.files = this.files.filter(f => f !== file);
  }

  async onRemoveExisting(f: ExistingFile) {
    const ok = await swal.fire({
      title: '¿Eliminar archivo?',
      text: f.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => r.isConfirmed);

    if (!ok) return;

    const payload = {
      p_arc_id: f.arc_id,
      p_arc_usumov: Number(localStorage.getItem('usuario') || 0)
    };

    this.loading = true;
  }

  procesaRegistro() {
    const formData = new FormData();
    formData.append("p_cnv_id", this.cnv_id === '0' ? "0" : this.cnv_id);
    formData.append("p_usu_id", String(localStorage.getItem("usuario")));
    formData.append("p_ard_id", this.ard_id === '0' ? "0" : this.ard_id);
    formData.append("p_tic_id", String(this.tic_id) === '0' ? "0" : String(this.tic_id));
    formData.append("p_res_id", String(this.res_id) === '0' ? "0" : String(this.res_id));
    formData.append("p_cnv_numero", String(this.cnv_numero));

    formData.append("p_cnv_fhoini", String(this.cnv_fhoini + ' 00:00:00'));
    formData.append("p_cnv_fhofin", String(this.cnv_fhofin));
    
    formData.append("p_cnv_feccnv", String(this.cnv_feccnv));
    formData.append("p_cnv_import", String(this.cnv_import));
    formData.append("p_cnv_numexp", String(this.cnv_numexp));
    formData.append("p_cnv_descri", String(this.cnv_descri));
    formData.append("p_cnv_observ", String(this.cnv_observ));
    
    this.files.forEach(f => formData.append("files[]", f));

    swal
      .fire({
        title: "Mensaje",
        html: "¿Seguro de registrar la convocatoria?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ACEPTAR",
        cancelButtonText: "CANCELAR",
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.api.getconvocatoriagra(formData).subscribe({
            next: (datos: any) => {
              if (datos.data.error == 0) {
                swal
                  .fire({
                    title: "Éxito",
                    html: datos.data.mensa,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "Aceptar",
                  })
                  .then(() => {
                    this.router.navigate(["/convocatorias"]);
                  });
              } else {
                swal.fire({
                  title: "Error",
                  text: datos.data.mensa,
                  icon: "error",
                  confirmButtonColor: "#3085d6",
                  confirmButtonText: "Aceptar",
                });
              }
            },
            error: (err) => {
              swal.fire("Error", "No se pudo registrar la Convocatoria", "error");
              console.error(err);
            },
          });
        }
      });
  }

  private async preloadDemoFiles() {

    //await this.pushAssetAsFile('assets/demo.jpg', 'demo.jpg', 'image/jpeg');
    //await this.pushAssetAsFile('assets/demo.pdf', 'demo.pdf', 'application/pdf');
  }

  private async pushAssetAsFile(url: string, filename: string, mime: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: mime, lastModified: Date.now() });

    const allowed = ['image/jpeg','image/jpg','image/png','application/pdf'];
    const max = 2 * 1024 * 1024;
    if (!allowed.includes(file.type)) return;
    if (file.size > max) return;

    const exists = this.files.some(f => f.name === file.name && f.size === file.size && f.type === file.type);
    if (!exists) this.files.push(file);
  }
}
