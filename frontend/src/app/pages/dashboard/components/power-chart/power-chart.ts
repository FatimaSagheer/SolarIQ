import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolarService } from '../../../../services/solar.services';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-power-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './power-chart.html',
  styleUrl: './power-chart.css'
})
export class PowerChartComponent implements AfterViewInit {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart: any;
  loading = true;

  constructor(
    private solarService: SolarService,
    private cdr: ChangeDetectorRef
  ) {}

  // ✅ use AfterViewInit instead of OnInit
  // because canvas element must exist in DOM before Chart.js can use it
  ngAfterViewInit() {
    this.loadChartData();
  }

  loadChartData() {
    this.solarService.getAllReadings().subscribe({
      next: (readings) => {
        this.loading = false;
        this.cdr.detectChanges(); // ✅ make canvas visible first
        this.buildChart(readings); // ✅ then build chart
      },
      error: (err) => {
        console.error('Chart error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  buildChart(readings: any[]) {
    const timeMap = new Map<string, number>();

    readings.forEach(r => {
      const time = new Date(r.timestamp).toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const current = timeMap.get(time) || 0;
      timeMap.set(time, current + (r.powerOutput || 0));
    });

    const labels = Array.from(timeMap.keys());
    const data = Array.from(timeMap.values()).map(v => parseFloat(v.toFixed(2)));

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total Power Output (kW)',
          data,
          borderColor: '#1D9E75',
          backgroundColor: 'rgba(29, 158, 117, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
          maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#ffffff' } }
        },
        scales: {
          x: {
            ticks: { color: '#888', maxTicksLimit: 12 },
            grid: { color: '#2a2f45' }
          },
          y: {
            ticks: { color: '#888' },
            grid: { color: '#2a2f45' }
          }
        }
      }
    });
  }
}