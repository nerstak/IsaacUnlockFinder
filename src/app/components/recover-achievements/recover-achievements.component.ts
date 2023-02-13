import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-recover-achievements',
  templateUrl: './recover-achievements.component.html',
  styleUrls: ['./recover-achievements.component.css']
})
export class RecoverAchievementsComponent {
  @Output()
  achievementsEmitter = new EventEmitter<number[]>();

  update(achievements: number[]) {
    this.achievementsEmitter.emit(achievements);
  }

}
