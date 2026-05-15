import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolarService } from '../../services/solar.services';
import { PowerChartComponent } from './components/power-chart/power-chart';
import { FaultListComponent } from './components/fault-list/fault-list';
import { SystemsMapComponent } from './components/systems-map/systems-map';

import { SocketService } from '../../services/socket';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,PowerChartComponent,FaultListComponent,SystemsMapComponent],
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
  
  lastUpdated = new Date();
  newFaultAlert = '';
   private subs: Subscription[] = [];
systems: any[] = [];
  constructor(
    private solarService: SolarService,
    private cdr: ChangeDetectorRef ,
    private socketService: SocketService,
     private authService: AuthService, 
      private router: Router,
  ) {}

  ngOnInit() {
    this.loadSummary();
     this.loadSystems();
  }

 loadSummary() {
    this.solarService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  listenToSocket() {
    // Listen for stats updates
    const statsSub = this.socketService.onStatsUpdate().subscribe(data => {
      this.summary = data;
      this.lastUpdated = new Date();
      this.cdr.detectChanges();
      console.log('📊 Stats updated live:', data);
    });

    // Listen for new faults
    const faultSub = this.socketService.onNewFault().subscribe(fault => {
      this.newFaultAlert = `⚠️ New fault: ${fault.type} at ${fault.systemId?.name}`;
      this.summary.fault += 1;
      this.cdr.detectChanges();

      // Clear alert after 5 seconds
      setTimeout(() => {
        this.newFaultAlert = '';
        this.cdr.detectChanges();
      }, 5000);
    });

    this.subs.push(statsSub, faultSub);
  }
  loadSystems() {
  this.solarService.getSystems().subscribe({
    next: (data) => {
      this.systems = data;
      this.cdr.detectChanges();
    }
  });
}
navigateToSystem(id: string) {
  this.router.navigate(['/systems', id]);
}

  // Clean up subscriptions when component destroyed
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.socketService.disconnect();
  }
  logout() {
  this.authService.logout();
}
}