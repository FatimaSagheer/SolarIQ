import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolarService } from '../../services/solar.services';
import { PowerChartComponent } from './components/power-chart/power-chart';
import { FaultListComponent } from './components/fault-list/fault-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,PowerChartComponent,FaultListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  summary = {
    total: 0,
    active: 0,
    fault: 0,
    offline: 0,
    totalPower: 0
  };

  loading = true;
  error = '';

  constructor(
    private solarService: SolarService,
    private cdr: ChangeDetectorRef  // ← add this
  ) {}

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.solarService.getSummary().subscribe({
      next: (data: { total: number; active: number; fault: number; offline: number; totalPower: number; }) => {
        this.summary = data;
        this.loading = false;
        this.cdr.detectChanges(); // ← force Angular to update UI
      },
      error: (err: any) => {
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.detectChanges(); // ← force Angular to update UI
      }
    });
  }
}