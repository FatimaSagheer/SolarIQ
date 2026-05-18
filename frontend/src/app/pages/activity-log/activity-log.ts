
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolarService } from '../../services/solar.services';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-log.html',
  styleUrl: './activity-log.css'
})
export class ActivityLog implements OnInit {

  logs: any[] = [];
  filteredLogs: any[] = [];
  stats: any = {};
  loading = true;
  filterAction = 'all';

  constructor(
    private solarService: SolarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLogs();
    this.loadStats();
  }

  loadLogs() {
    this.solarService.getActivityLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Activity logs error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats() {
    this.solarService.getActivityStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter logs by action
  filterLogs() {
    if (this.filterAction === 'all') {
      this.filteredLogs = this.logs;
    } else {
      this.filteredLogs = this.logs.filter(
        log => log.action === this.filterAction
      );
    }
    this.cdr.detectChanges();
  }

  getActionColor(action: string): string {
    const map: any = {
      login:           '#1D9E75',
      logout:          '#888888',
      resolve_fault:   '#7F77DD',
      view_system:     '#00BFFF',
      view_dashboard:  '#EF9F27',
      register:        '#1D9E75'
    };
    return map[action] || '#888';
  }

  getStatusColor(status: string): string {
    return status === 'success' ? '#1D9E75' : '#E24B4A';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}