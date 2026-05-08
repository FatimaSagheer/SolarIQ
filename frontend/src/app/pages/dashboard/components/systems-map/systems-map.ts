import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolarService } from '../../../../services/solar.services';
import * as L from 'leaflet';



@Component({
  selector: 'app-systems-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './systems-map.html',
  styleUrl: './systems-map.css'
})
export class SystemsMapComponent implements AfterViewInit {

  map: any;
  loading = true;
  

  constructor(
    private solarService: SolarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
  // Wait for DOM to fully render
  setTimeout(() => {
    this.initMap();
  }, 200);
}

initMap() {
  this.map = L.map('pakistan-map', {
    center: [30.3753, 69.3451],
    zoom: 5
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 5
  }).addTo(this.map);
    //  L.control.zoom({ position: 'topleft' }).addTo(this.map);

  this.solarService.getSystems().subscribe({
    next: (systems) => {
      this.addMarkers(systems);
      this.fitMapToPakistan(); // ← fit bounds after markers
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.map.invalidateSize(), 200);
    },
    error: (err) => {
      console.error('Map error:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

// ✅ fit map to Pakistan bounds exactly
fitMapToPakistan() {
  const pakistanBounds = L.latLngBounds(
    L.latLng(23.5, 60.5),  // southwest corner
    L.latLng(37.5, 77.5)   // northeast corner
  );
  this.map.fitBounds(pakistanBounds);
}
  addMarkers(systems: any[]) {
    systems.forEach(system => {

      // Color based on status
      const color = system.status === 'active'  ? '#1D9E75' :
                    system.status === 'fault'   ? '#E24B4A' :
                    system.status === 'offline' ? '#EF9F27' : '#888';

      // Custom circle marker
      const marker = L.circleMarker([system.lat, system.lon], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9
      });

      // Popup on click
      marker.bindPopup(`
        <div style="color:#000; min-width:180px;">
          <strong>${system.name}</strong><br/>
          📍 ${system.city}<br/>
          ⚡ ${system.capacity} kW capacity<br/>
          🔧 ${system.panelCount} panels<br/>
          📊 PR: ${system.performanceRatio}<br/>
          <span style="
            background:${color};
            color:#fff;
            padding:2px 8px;
            border-radius:10px;
            font-size:11px;
          ">${system.status.toUpperCase()}</span>
        </div>
      `);

      marker.addTo(this.map);
    });
  }
}