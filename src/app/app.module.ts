import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import { RecoverAchievementsComponent } from './components/recover-achievements/recover-achievements.component';
import { AchievementsAnalysisComponent } from './components/achievements-analysis/achievements-analysis.component';
import {MatDividerModule} from "@angular/material/divider";
import {MatToolbarModule} from "@angular/material/toolbar";
import { AchievementComponent } from './components/achievement/achievement.component';
import {MatTabsModule} from "@angular/material/tabs";
import { ListAchievementsComponent } from './components/list-achievements/list-achievements.component';

@NgModule({
  declarations: [
    AppComponent,
    UploaderComponent,
    RecoverAchievementsComponent,
    AchievementsAnalysisComponent,
    AchievementComponent,
    ListAchievementsComponent
  ],
    imports: [
        BrowserModule.withServerTransition({appId: 'serverApp'}),
        AppRoutingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        MatToolbarModule,
        MatTabsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
