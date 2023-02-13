import {Component} from '@angular/core';
import achievements from '../../../assets/achievements.json'

@Component({
  selector: 'app-achievements-analysis',
  templateUrl: './achievements-analysis.component.html',
  styleUrls: ['./achievements-analysis.component.css']
})
export class AchievementsAnalysisComponent {
  achievementsDependency: Achievement[] = achievements

  unlockables: Achievement[] = [];

  loaded = false;

  analyze(achievementsSave: number[]) {
    const unlocks = new Map(achievementsSave.entries());

    for (let unlock of achievementsSave.entries()) {
      if (unlock[1] === 0) { // Locked achievement
        // Removing achievements that depend on this one (cannot be unlocked yet)
        this.achievementsDependency.filter(x => {
          return this.findAchievement(unlock[0], x);
        }).flatMap((value, _) => value.RequiredForAchievements)
          .forEach(x => {
            if (x !== null) {
              // TODO: Register all of this soft locked achievements
              unlocks.delete(parseInt(x));
            }
          })

      } else if (unlock[1] === 1) { // Unlocked achievement
        // Cannot be unlocked a second time
        // TODO: Register list of unlocked achievements
        unlocks.delete(unlock[0]);
      }
    }
    for (let unlock of unlocks) {
      const tmp = this.achievementsDependency.find(x => this.findAchievement(unlock[0], x))
      if (tmp !== undefined) {
        this.unlockables.push(tmp)
      }
    }
    this.loaded = true;
  }

  private findAchievement(id: number, x: Achievement) {
    if (id != 77) return x.Id === id.toString();

    // 77 is composed of 2 different achievements, as it is unlockable of 2 different ways
    return x.Id === "77.1" || x.Id === "77.2";
  }
}
