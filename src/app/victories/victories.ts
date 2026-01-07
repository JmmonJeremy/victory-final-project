import { Component } from '@angular/core';

import { Victory } from './victory.model'
import { VictoryService } from './victory.service';

@Component({
  selector: 'app-victories',
  standalone: false,
  templateUrl: './victories.html',
  styleUrl: './victories.css'
})
export class Victories implements OnInit {
  selectedVictory: Victory;

  constructor(private victoryService: VictoryService) {

  }

  ngOnInit(): void {
    this.victoryService.victorySelectedEvent
      .subscribe(
        (victory: Victory) => {
          this.selectedVictory = victory;
        }
      );
  }
}
