import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    // Connect to backend
    this.socket = io(environment.apiUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }

  // Listen for new readings
  onNewReading(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('reading:new', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for new faults
  onNewFault(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('fault:new', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for stats updates
  onStatsUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('stats:update', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}