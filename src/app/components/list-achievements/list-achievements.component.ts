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

  @Input()
  blockedBy: Map<string, Achievement[]> | undefined;

  protected getListOfBlocking(s: string) {
    if (this.blockedBy != undefined) {
      const res = this.blockedBy.get(s);
      if (res !== undefined) {
        return res;
      }
    }
    return [];
  }
}
