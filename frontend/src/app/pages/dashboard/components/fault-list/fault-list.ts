import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolarService } from '../../../../services/solar.services';

@Component({
  selector: 'app-fault-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fault-list.html',
  styleUrl: './fault-list.css'
})
export class FaultListComponent implements OnInit {

  faults: any[] = [];
  loading = true;

  constructor(
    private solarService: SolarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFaults();
  }

  loadFaults() {
    this.solarService.getFaults().subscribe({
      next: (data) => {
        this.faults = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Faults error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resolveFault(faultId: string) {
    this.solarService.resolveFault(faultId).subscribe({
      next: () => {
        // Remove resolved fault from list
        this.faults = this.faults.filter(f => f._id !== faultId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Resolve error:', err)
    });
  }

  getSeverityClass(severity: string): string {
    const map: any = {
      critical: 'severity-critical',
      high:     'severity-high',
      medium:   'severity-medium',
      low:      'severity-low'
    };
    return map[severity] || '';
  }
}