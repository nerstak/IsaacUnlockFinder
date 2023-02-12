import {Component, EventEmitter, Output} from '@angular/core';
import {SaveFileValidatorService} from "../../services/save-file-validator.service";
import {AchievementsChunk} from "../../lib/IsaacSaveFile";

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent {
  @Output()
  achievementsEmitter = new EventEmitter<number[]>();
  @Output()
  errorEmitter = new EventEmitter<string>();

  constructor(public saveFileValidator: SaveFileValidatorService) {
  }

  onFileSelected() {
    const inputNode: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const save = this.saveFileValidator.verify(e.target);
          const achievements = (save.chunks[ChunkType.ACHIEVEMENTS - 1].body as AchievementsChunk).achievements;
          this.achievementsEmitter.emit(achievements)
        } catch (err) {
          const errTxt = err as string;
          console.log(err);
          this.errorEmitter.emit(errTxt);
        }
      };

      reader.readAsArrayBuffer(inputNode.files[0]);
    }
  }
}
