import {Component, EventEmitter, Output} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-recover-achievements',
  templateUrl: './recover-achievements.component.html',
  styleUrls: ['./recover-achievements.component.css']
})
export class RecoverAchievementsComponent {
  @Output()
  achievementsEmitter = new EventEmitter<number[]>();

  error: String = "";

  constructor(private snack: MatSnackBar) {
  }

  update(achievements: number[]) {
    this.achievementsEmitter.emit(achievements);
    this.snack.dismiss();
  }

  updateErrors(error: string) {
    this.snack.open(error, 'Dismiss', {
      horizontalPosition: "end",
      verticalPosition: "bottom",
    });
  }
}
