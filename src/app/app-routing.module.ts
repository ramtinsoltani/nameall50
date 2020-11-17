import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { LeaderboardsComponent } from './components/leaderboards/leaderboards.component';

const routes: Routes = [
  { path: '', component: GameComponent, pathMatch: 'full' },
  { path: 'leaderboards', component: LeaderboardsComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
