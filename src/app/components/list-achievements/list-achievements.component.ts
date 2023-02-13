import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-list-achievements',
  templateUrl: './list-achievements.component.html',
  styleUrls: ['./list-achievements.component.css']
})
export class ListAchievementsComponent {
  @Input()
  list: Achievement[] | undefined;
  @Input()
  description: string | undefined;
}
