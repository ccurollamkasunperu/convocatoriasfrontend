import { Component,TemplateRef,OnInit,Input,ViewChild} from "@angular/core";
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";

interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.component.html',
  styleUrls: ['./convocatorias.component.css']
})

export class ConvocatoriasComponent implements OnInit {
  private permSet = new Set<number>();

  btnPerm = {
    nuevo: false,
    excel: false,
  };

  titulopant : string = "Convocatorias";
  icono : string = "pe-7s-next-2";
  loading: boolean = false;
  exportarHabilitado: boolean = false;
  modalRef?: BsModalRef;
  selectedConvocatoria: any;

  btnnuevo:boolean=false;
  btnexcel:boolean=false;

  ObjetoMenu: any[] = [];
  jsn_permis: any[] = [];
  ruta: string = '';
  objid : number = 0 ;

  //INICIO PARAMETROS
  dataConvocatoria:any;
  dataTipoConvocatoria:any;

  cnv_id:string='';
  cnv_numero:string='';
  est_id:string='';
  usu_id:string='';
  cnv_fecini:string='';
  cnv_fecfin:string='';
  cnv_activo:string='1';
  ard_id:string='0';
  tic_id:string='0';

  //FIN DE PARAMETROS

  @ViewChild('OpenModalVerConvocatoria', { static: false }) OpenModalVerConvocatoria!: TemplateRef<any>;
  @ViewChild('OpenModalEditarConvocatoria', { static: false }) OpenModalEditarConvocatoria!: TemplateRef<any>;
  @ViewChild('OpenModalAnularConvocatoria', { static: false }) OpenModalAnularConvocatoria!: TemplateRef<any>;
  @ViewChild('OpenModalTrazabilidadConvocatoria', { static: false }) OpenModalTrazabilidadConvocatoria!: TemplateRef<any>;
  @ViewChild('OpenModalConvocatoriaTDR', { static: false }) OpenModalConvocatoriaTDR!: TemplateRef<any>;
  @ViewChild('OpenModalConvocatoriaCronograma', { static: false }) OpenModalConvocatoriaCronograma!: TemplateRef<any>;
  @ViewChild('OpenModalConvocatoriaAnexo', { static: false }) OpenModalConvocatoriaAnexo!: TemplateRef<any>;
  @ViewChild('OpenModalConvocatoriaComunicados', { static: false }) OpenModalConvocatoriaComunicados!: TemplateRef<any>;
  @ViewChild('OpenModalConvocatoriaResultados', { static: false }) OpenModalConvocatoriaResultados!: TemplateRef<any>;
  @ViewChild('OpenModalCerrarConvocatoria', { static: false }) OpenModalCerrarConvocatoria!: TemplateRef<any>;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  rowSelected : any;
  dataanteriorseleccionada : any;
  
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {
    destroy: false,
    retrieve: true,
    pagingType: "full_numbers",
    pageLength: 10,
    dom: "Bfrtip",
    buttons: ["excel"],
    select: true,
    responsive: true,
    autoWidth: false,
    searching: true,
    order: [[0, 'desc']], 
    columnDefs: [
      { targets: 0, className: 'text-center', width: '20px' },
      { targets: 1, className: 'cell-wrap' },
      { targets: [2,3,4,5,6,7,8,9], className: 'text-center', width: '40px' },
    ],
    rowCallback: (row: Node, data: any[] | Object, index: number) => {
      const self = this;
      $("td", row).off("click");
      $("td", row).on("click", () => {
        this.rowSelected = data;
        if (this.rowSelected !== this.dataanteriorseleccionada) {
          this.dataanteriorseleccionada = this.rowSelected;
        } else {
          this.dataanteriorseleccionada = [];
        }

        const anular = document.getElementById('anular') as HTMLButtonElement | null;
        if (anular) {
          anular.disabled = false;
        }
      });
      return row;
    },
    language: {
      processing: "Procesando...",
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ elementos",
      info: "Mostrando desde _START_ al _END_ de _TOTAL_ elementos",
      infoEmpty: "Mostrando ningún elemento.",
      infoFiltered: "(filtrado _MAX_ elementos total)",
      loadingRecords: "Cargando registros...",
      zeroRecords: "No se encontraron registros",
      emptyTable: "No hay datos disponibles en la tabla",
      select: {
        rows: {
          _: "%d filas seleccionadas",
          0: "Haga clic en una fila para seleccionarla",
          1: "Convocatoria seleccionada",
        },
      },
      paginate: {
        first: "Primero",
        previous: "Anterior",
        next: "Siguiente",
        last: "Último",
      },
      aria: {
        sortAscending: ": Activar para ordenar la tabla en orden ascendente",
        sortDescending: ": Activar para ordenar la tabla en orden descendente",
      },
    },
  };
  
  constructor(
    private router: Router,
    private modalService: BsModalService,
    private api: ApiService,
    private appComponent: AppComponent
  ) {
  }

  ngOnInit(): void {
    this.SetMesIniFin();
    this.usu_id = sessionStorage.getItem('usuario');
    this.loadTipoConvocatoria();
    this.getObjetoMenu();
    this.ObtenerObjId();
    this.loadDataProceso();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  descargaExcel() {
    let btnExcel = document.querySelector('#tablaDataProceso .dt-buttons .dt-button.buttons-excel.buttons-html5') as HTMLButtonElement;
    btnExcel.click();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }
  
  CerrarModalProceso() {
    this.loadDataProceso();
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  loadTipoConvocatoria() {
    const data_post = {
      p_tic_id: 0,
      p_tic_activo: 1
    };

    this.api.gettipoconvocatoriasel(data_post).subscribe((data: any) => {
      this.dataTipoConvocatoria = data;
    });
  }

  loadDataProceso() {
    this.loading = true;

    const data_post = {
      p_cnv_id:     (this.cnv_id == null || this.cnv_id === '') ? 0 : parseInt(this.cnv_id),
      p_cnv_numero: (this.cnv_numero == null || this.cnv_numero === '') ? 0 : parseInt(this.cnv_numero),
      p_est_id:     (this.est_id == null || this.est_id === '') ? 0 : parseInt(this.est_id),
      p_usu_id:     (sessionStorage.getItem('usuario') == null || sessionStorage.getItem('usuario') === '' ) ? 0 : parseInt(sessionStorage.getItem('usuario')),
      p_ard_id:     (this.ard_id == null || this.ard_id === '') ? 0 : parseInt(this.ard_id),
      p_tic_id:     (this.tic_id == null || this.tic_id === '') ? 0 : parseInt(this.tic_id),
      p_cnv_fecini: this.cnv_fecini,
      p_cnv_fecfin: this.cnv_fecfin,
      p_jsn_permis: this.jsn_permis,
      p_cnv_activo: (this.cnv_activo == null || this.cnv_activo === '') ? 0 : parseInt(this.cnv_activo)
    };

    this.api.getconvocatoriasel(data_post).subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataConvocatoria = data.map(item => ({
            ...item,
            bot_botons_parsed: this.safeParse(item.bot_botons)
          }));
          this.exportarHabilitado = true;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } else {
          this.dataConvocatoria = [];
          this.exportarHabilitado = false;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
          });
        }
        this.loading = false;
      },
      error: (err: any) => {
        // Si el interceptor ya manejó expiración de sesión (401), no mostrar alertas adicionales
        if (err && err.status === 401) {
          this.loading = false;
          this.exportarHabilitado = false;
          return;
        }
        this.loading = false;
        this.exportarHabilitado = false;
        swal.fire('Error', 'Ocurrió un error al cargar los datos', 'error');
      }
    });
  }

  ObtenerObjId(){
    this.ruta = this.router.url.replace(/^\/+/, '');
    console.log('Ruta actual:', this.ruta);

    const match = this.ObjetoMenu.find(item => item.obj_enlace === this.ruta);
    console.log('Objeto de menú coincidente:', match);
    if (match) {
      this.objid = match.obj_id;
      this.jsn_permis = match.jsn_permis;

      let permisos: PermisoBtn[] = [];
      const raw = match.jsn_permis;
  
      try {
        const parsed = (typeof raw === 'string') ? JSON.parse(raw) : raw;
        permisos = Array.isArray(parsed) ? parsed : [];
      } catch {
        permisos = [];
      }

      const ids = permisos.filter(p => Number(p.pus_activo) === 1).map(p => Number(p.bot_id));
      
      this.permSet = new Set<number>(ids);

      this.btnPerm.nuevo = this.permSet.has(1);
      this.btnPerm.excel = this.permSet.has(5);
      
      console.log('Permisos activos:', [...this.permSet]);
    } else {
      console.log('Ruta no encontrada en objetosMenu');
    }
  }

  private resetPermFlags() {
    Object.keys(this.btnPerm).forEach(k => (this.btnPerm as any)[k] = false);
  }

  hasPerm(botId: number): boolean {
    return this.permSet.has(botId);
  }

  tieneAcciones(item: any): boolean {
    return (
      item.cnv_chkver ||
      item.cnv_chkedt ||
      item.cnv_chkanu ||
      item.cnv_chkasg ||
      item.cnv_chkpub === 1 ||
      item.cnv_chkpub === 2 ||
      item.cnv_chktrz ||
      item.cnv_chkcer
    );
  }


  getObjetoMenu() {
    const ObjetoMenu = sessionStorage.getItem('objetosMenu');
    this.ObjetoMenu = ObjetoMenu ? JSON.parse(ObjetoMenu) : [];
  }

  SetMesIniFin(){
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');

    this.cnv_fecini = `${yyyy}-${mm}-01`;
    this.cnv_fecfin = `${yyyy}-${mm}-${dd}`;
  }

  ConvocatoriaIns() {
    this.router.navigate(['/nueva-convocatoria']);
  }
  
  ConvocatoriaEdit(cnv_id: string) {
    this.router.navigate(['/editar-convocatoria',cnv_id]); 
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

    //PARSE BUTTONS ARRAY 
  safeParse(jsonStr: string): any[] {
    try {
      return JSON.parse(jsonStr || '[]');
    } catch (e) {
      console.error('Error al parsear bot_botons:', e);
      return [];
    }
  }

  PublicDespublic(item: any) {
      const dataPost = {
        p_cnv_id:(item.cnv_id == null || item.cnv_id === '') ? 0 : parseInt(item.cnv_id),
        p_usu_id:parseInt(sessionStorage.getItem("usuario"))
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
          this.api.getconvocatoriapub(dataPost).subscribe((data: any) => {
            if(data[0].error == 0){
              swal.fire({
                title: 'Exito',
                html: data[0].mensa.trim(),
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
              }).then((result) => {
                if (result.value) {
                  setTimeout(() => {
                    this.loadDataProceso();
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
          });
        }
      })
    }

  getIdButton(bot_id: any, item: any) {
    
    this.selectedConvocatoria = item;

    switch (bot_id) {
      case 2:
        this.modalRef = this.modalService.show(this.OpenModalEditarConvocatoria);
        break;
      case 3:
        this.modalRef = this.modalService.show(this.OpenModalAnularConvocatoria);
        break;
      case 4:
        this.modalRef = this.modalService.show(this.OpenModalVerConvocatoria);
        break;
      case 6:
        this.modalRef = this.modalService.show(this.OpenModalVerConvocatoria);
        break;
      case 10:
        this.modalRef = this.modalService.show(this.OpenModalCerrarConvocatoria);
        break;
      case 11:
        this.modalRef = this.modalService.show(this.OpenModalTrazabilidadConvocatoria);
        break;
      case 15:
        this.PublicDespublic(item);
        break;
      case 'TDR':
        this.modalRef = this.modalService.show(this.OpenModalConvocatoriaTDR,{ class: 'modal-xl modal-dialog-centered' });
        break;
      case 'CRO':
        this.modalRef = this.modalService.show(this.OpenModalConvocatoriaCronograma,{ class: 'modal-xl modal-dialog-centered' });
        break;
      case 'ANE':
        this.modalRef = this.modalService.show(this.OpenModalConvocatoriaAnexo,{ class: 'modal-xl modal-dialog-centered' });
        break;
      case 'COM':
        this.modalRef = this.modalService.show(this.OpenModalConvocatoriaComunicados,{ class: 'modal-xl modal-dialog-centered' });
        break;
      case 'RES':
        this.modalRef = this.modalService.show(this.OpenModalConvocatoriaResultados,{ class: 'modal-xl modal-dialog-centered' });
        break;
      default:
        console.warn('Botón no reconocido:', bot_id);
        break;
    }
  }
}
