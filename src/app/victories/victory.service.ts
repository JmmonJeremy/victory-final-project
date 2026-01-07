import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Victory } from './victory.model';
import { DAYS_OF_WEEK } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class VictoryService {
  victoryChangedEvent = new Subject<Victory[]>();
  victorySelectedEvent = new EventEmitter<Victory>();
  victories: Victory[] = [];
  maxVictoryId: number; 
  inAddButton: boolean = false;
  notEmptyEditDay: string = "other"; 
  closeEditDay: boolean = false;
  editDayNavMode: boolean = false;
  dayNavigation: string = "other";
  emptyDays: boolean = false;
  victoryDetail: string = "boolean+day";

  private stateChanged = new Subject<void>();
  stateChanged$ = this.stateChanged.asObservable();

  constructor(private http: HttpClient) { }

// NEW: Reset method for leaving edit
  resetVictoryDetail(): void {
    this.victoryDetail = '';
    this.stateChanged.next();  // Notify items to re-evaluate
  } 

  private sortThenSend() {
    this.victories.sort((a, b) => {
      const dayDiff = 
        DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return Number(a.number) - Number(b.number);
    });

    this.victoryChangedEvent.next(this.victories.slice());
  }

  getVictories(): void {
    this.http.get<{ message: string, victories: Victory[] }>(`${environment.apiUrl}/victories`).subscribe({
      // Success callback
      next: (response) => {        
        this.victories = response.victories;
        console.log("Raw victory from server:", response.victories[0]);
        for (const key of Object.keys(response.victories[0])) {
          console.log("KEY:", key, "TYPE:", typeof response.victories[0][key]);
        }

        console.log('Victories loaded:', this.victories);
        this.maxVictoryId = this.getMaxVId();
        this.sortThenSend();
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading victories:', error);
      }
    });     
  }

  getVictory(id: string): Victory {     
    for (let victory of this.victories) {
      if (victory.id === id) {
        return victory;
      }
    }
    return null;
  }
    
  getMaxVId(): number {
    let maxId = 0;
    for (const victory of this.victories) {
      const currentId = parseInt(victory.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

  getVictoriesList() {
    return this.victories.slice(); // full list copy
  }

  getVictoriesByDay(day: string): Victory[] {
    if (!this.victories || this.victories.length === 0) return [];
    return this.victories.filter(v => v.day === day);
  }

  private reorderVictoryList(targetDay: string): void {
    // Get only the victories for that day
    const daily = this.victories
      .filter(v => v.day === targetDay)
      // sort them
      .sort((a, b) => a.number - b.number);
    // Renumber them 1..N
    daily.forEach((v, i) => v.number = i + 1);
  }

  /**
 * Reorders numbering within a single day, inserting a victory
 * at its chosen number and shifting others accordingly.
 */
private reorderByNumberWithinDay(day: string, victoryId: string, requestedNumber: number): void {
  // 1. Extract victories for that day in sorted order
  let sameDay = this.victories
    .filter(v => v.day === day)
    .sort((a, b) => a.number - b.number);

  const otherDays = this.victories.filter(v => v.day !== day);

  // If the list is empty, nothing to do
  if (!sameDay.length) return;

  // 2. Remove the targeted victory from the list
  const index = sameDay.findIndex(v => v.id === victoryId);
  if (index === -1) return;

  const [removed] = sameDay.splice(index, 1);

  // 3. Compute the insertion index based on requestedNumber
  const insertIndex = Math.max(
    0,
    Math.min(requestedNumber - 1, sameDay.length) // cap at end
  );

  // 4. Insert the victory back into the target slot
  sameDay.splice(insertIndex, 0, removed);

  // 5. Renumber sequentially 1..N
  sameDay = sameDay.map((v, idx) => {
    v.number = idx + 1;
    return v;
  });

  // 6. Merge back into main list
  this.victories = [...sameDay, ...otherDays];
}
  
  private persistReorderedVictories(day: string): void {
    const daily = this.victories.filter(v => v.day === day);

    daily.forEach(v => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.put(`${environment.apiUrl}/victories/${v.id}`, v, { headers })
        .subscribe({
          error: err => console.error('Failed reorder update for', v, err)
        });
    });
  }

  addVictory(victory: Victory) {
    if (!victory) {
      return;
    }
    // make sure id of the new Victory is empty
    victory.id = '';
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // add to database
    this.http.post<{ message: string, victory: Victory }>(`${environment.apiUrl}/victories`,
      victory,
      { headers: headers })
      .subscribe(
        (responseData) => {
          // consolidate to single variable 
          const saved = responseData.victory;
          // add new victory to victories
          this.victories.push(saved);
          // reassign numbering within a day by passing in the day
          this.reorderVictoryList(saved.day);
          // save the change to the database
          this.persistReorderedVictories(saved.day);
          // now update sorting + emit
          this.sortThenSend();
        }
      );
  }

  updateVictory(originalVictory: Victory, newVictory: Victory) {
    if (!originalVictory || !newVictory) {
      return;
    }
    const pos = this.victories.indexOf(originalVictory);
    if (pos < 0) {
      return;
    }
    // set the id of the new Victory to the id of the old Victory
    newVictory.id = originalVictory.id;
    newVictory._id = originalVictory._id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // update database
    this.http.put(`${environment.apiUrl}/victories/` + originalVictory.id,
      newVictory, { headers: headers })
      .subscribe(
        (response: Response) => {
          // replace victory with new version
          this.victories[pos] = newVictory;
          // reassign numbering within a day by passing in the day
          //  this.reorderVictoryList(newVictory.day);
          // // save the change to the database
          // this.persistReorderedVictories(newVictory.day);
          // now update sorting + emit
          this.sortThenSend();
        }
      );
  }

  deleteVictory(victory: Victory) {
    if (!victory) {
        return;
    }
    const pos = this.victories.findIndex(d => d.id === victory.id);
    if (pos < 0) {
        return;
    }
    // delete from database
    this.http.delete(`${environment.apiUrl}/victories/` + victory.id)
      .subscribe(
        (response: Response) => {
          this.victories.splice(pos, 1);
          this.sortThenSend();
        }
      );
  }
}