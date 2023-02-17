import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.css']
})
export class AchievementComponent {
  @Input()
  achievement: Achievement | undefined

  @Input()
  blockedBy: Achievement[] = [];
}
