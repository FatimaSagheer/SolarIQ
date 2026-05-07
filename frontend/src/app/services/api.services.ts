import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolarService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch KPI summary — total, active, fault, offline, totalPower
  getSummary(): Observable<any> {
    return this.http.get(`${this.api}/api/systems/stats/summary`);
  }

  // Fetch all systems
  getSystems(): Observable<any> {
    return this.http.get(`${this.api}/api/systems`);
  }

  // Fetch all active faults
  getFaults(): Observable<any> {
    return this.http.get(`${this.api}/api/faults`);
  }

  // Fetch readings for one system
  getReadings(systemId: string): Observable<any> {
    return this.http.get(`${this.api}/api/readings/${systemId}`);
  }
}