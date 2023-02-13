import {Component} from '@angular/core';
import achievements from '../../../../scripts/achievements.json'

@Component({
  selector: 'app-achievements-analysis',
  templateUrl: './achievements-analysis.component.html',
  styleUrls: ['./achievements-analysis.component.css']
})
export class AchievementsAnalysisComponent {
  achievementsDependency: Achievement[] = achievements

  analyze(achievementsSave: number[]) {
    const unlocks = new Map(achievementsSave.entries())

    for (let unlock of achievementsSave.entries()) {
      if (unlock[1] === 0) { // Locked achievement
        // Removing achievements that depend on this one (cannot be unlocked yet)
        this.achievementsDependency.filter(x => {
          if (unlock[0] != 77) return x.Id === unlock[0].toString();

          // 77 is composed of 2 different achievements, as it is unlockable of 2 different ways
          return x.Id === "77.1" || x.Id === "77.2";
        }).flatMap((value, _) => value.RequiredForAchievements)
          .forEach(x => {
            if (x !== null) {
              unlocks.delete(parseInt(x))
            }
          })

      } else if (unlock[1] === 1) { // Unlocked achievement
        // Cannot be unlocked a second time
        unlocks.delete(unlock[0])
      }
    }
    console.log(unlocks)
  }
}
