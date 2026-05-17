import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-stats.html',
  styleUrls: ['./kpi-stats.css'],
})
export class KpiStatsComponent implements OnInit {
  // Estos datos luego vendrán de tu RoomService
  public stats = {
    total: 0,
    disponibles: 0,
    ocupadas: 0,
    sucias: 0,
    limpieza: 0,
  };

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    // Simulación inicial, luego llamarás a Java
    this.stats = {
      total: 12,
      disponibles: 8,
      ocupadas: 2,
      sucias: 1,
      limpieza: 1,
    };
  }
}
