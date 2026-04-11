import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private refreshDataSubject = new BehaviorSubject<boolean>(false);
  refreshData$ = this.refreshDataSubject.asObservable();

  triggerDataRefresh() {
    this.refreshDataSubject.next(true);
  }
}
