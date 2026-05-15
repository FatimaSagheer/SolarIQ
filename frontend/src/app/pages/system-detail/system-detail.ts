import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolarService } from '../../services/solar.services';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-system-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-detail.html',
  styleUrl: './system-detail.css'
})
export class SystemDetail implements OnInit, AfterViewInit {

  @ViewChild('readingsChart') chartCanvas!: ElementRef;
  
  system: any = null;
  readings: any[] = [];
  faults: any[] = [];
  latestReading: any = null;
  loading = true;
  chart: any;
  systemId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solarService: SolarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ read :id from URL
    this.systemId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAll();
  }

  ngAfterViewInit() {}

  loadAll() {
    // Load system, readings and faults in parallel
    this.solarService.getSystem(this.systemId).subscribe({
      next: (data: any) => {
        this.system = data;
        this.cdr.detectChanges();
      }
    });

    this.solarService.getSystemReadings(this.systemId).subscribe({
      next: (data: any[]) => {
        this.readings = data;
        this.latestReading = data[0]; // latest reading
        this.loading = false;
        this.cdr.detectChanges();
        this.buildChart(data);
      }
    });

    this.solarService.getSystemFaults(this.systemId).subscribe({
      next: (data: any[]) => {
        this.faults = data;
        this.cdr.detectChanges();
      }
    });
  }

  buildChart(readings: any[]) {
    setTimeout(() => {
      if (!this.chartCanvas) return;
      
      const labels = readings
        .slice()
        .reverse()
        .map(r => new Date(r.timestamp).toLocaleTimeString('en-PK', {
          hour: '2-digit', minute: '2-digit'
        }));

      const data = readings
        .slice()
        .reverse()
        .map(r => r.powerOutput || 0);

      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Power Output (kW)',
            data,
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29,158,117,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#ffffff' } }
          },
          scales: {
            x: { ticks: { color: '#888', maxTicksLimit: 8 }, grid: { color: '#2a2f45' } },
            y: { ticks: { color: '#888' }, grid: { color: '#2a2f45' } }
          }
        }
      });
    }, 100);
  }

  getStatusColor(status: string): string {
    const map: any = {
      active:  '#1D9E75',
      fault:   '#E24B4A',
      offline: '#EF9F27'
    };
    return map[status] || '#888';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}