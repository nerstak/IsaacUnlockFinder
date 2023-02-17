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
  alreadyUnlocked: Achievement[] = [];
  softLocked: Achievement[] = [];
  blockedBy = new Map<string, Achievement[]>();

  loaded = false;

  analyze(achievementsSave: number[]) {
    const unlocks = new Map(achievementsSave.entries());
    const alreadyUnlocked = new Map<number, number>();
    const softLocked = new Map<number, number>();
    const blockedBy = new Map<number, number[]>();

    for (let unlock of achievementsSave.entries()) {
      if (unlock[1] === 0) { // Locked achievement
        // Removing achievements that depend on this one (cannot be unlocked yet)
        this.achievementsDependency.filter(x => {
          return this.findAchievement(unlock[0], x);
        }).flatMap((value, _) => value.RequiredForAchievements)
          .forEach(x => {
            if (x !== null) {

              softLocked.set(parseInt(x), 1);
              unlocks.delete(parseInt(x));


              // Register list of dependency
              const key = parseInt(x);
              const t = blockedBy.get(key);

              if (t !== undefined) {
                t.push(unlock[0]);
              } else {
                blockedBy.set(parseInt(x), [unlock[0]]);
              }
            }
          })

      } else if (unlock[1] === 1) { // Unlocked achievement
        // Cannot be unlocked a second time
        alreadyUnlocked.set(unlock[0], 1);
        unlocks.delete(unlock[0]);
      }
    }
    this.unlockables = this.listToAchievementsList(unlocks, this.unlockables);
    this.alreadyUnlocked = this.listToAchievementsList(alreadyUnlocked, this.alreadyUnlocked);
    this.softLocked = this.listToAchievementsList(softLocked, this.softLocked).sort((x,y) => {
      return (parseInt(x.Id) | 0) - (parseInt(y.Id) | 0);
    });
    this.blockedBy = this.mapToDependencies(blockedBy, this.blockedBy);

    this.loaded = true;
  }

  private listToAchievementsList(ach: Map<number, number>, list: Achievement[]) {
    for (let unlock of ach) {
      const tmp = this.achievementsDependency.find(x => this.findAchievement(unlock[0], x))
      if (tmp !== undefined) {
        list.push(tmp);
      }
    }

    return list;
  }

  private mapToDependencies(ach: Map<number, number[]>, list: Map<string, Achievement[]>) {
    for (let unlock of ach.entries()) {
      for (let dep of unlock[1]) {
        const tmp = this.achievementsDependency.find(x => this.findAchievement(dep, x));

        if (tmp !== undefined) {
          const key = unlock[0].toString();
          if (list.has(key)) {
            const t = list.get(key);
            if (t !== undefined) t.push(tmp);
          } else {
            list.set(key, [tmp]);
          }
        }
      }
    }

    return list;
  }


  private findAchievement(id: number, x: Achievement) {
    if (id != 77) return x.Id === id.toString();

    // 77 is composed of 2 different achievements, as it is unlockable of 2 different ways
    return x.Id === "77.1" || x.Id === "77.2";
  }
}
