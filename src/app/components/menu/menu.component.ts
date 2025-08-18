import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  objetomenu: any[] = [];

  ngOnInit(): void {
    this.getObjetosMenu();
    console.log("Objetos del menú:", this.objetomenu);
  }

  getObjetosMenu() {
    const ObjetoMenuString = localStorage.getItem('objetosMenu');
    if (ObjetoMenuString) {
      this.objetomenu = JSON.parse(ObjetoMenuString);
    } else {
      this.objetomenu = [];
    }
  }
}