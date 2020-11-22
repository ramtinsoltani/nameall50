import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService, UpdateState, StatesData } from '@app/service/app';
import _ from 'lodash-es';
import { FirestoreService } from '@app/service/firestore';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  @ViewChild('gameInput') private gameInput!: ElementRef<HTMLInputElement>;
  public state: GameState = GameState.Start;
  public time: number = AppService.GAME_TIME;
  public identical: boolean = false;
  public correct: boolean = false;
  public statesMissed: number = 50;
  public gameTime: number = AppService.GAME_TIME;
  public statesMapData: StatesData = {};
  public buttonsDisabled: boolean = false;

  constructor(
    public app: AppService,
    private firestore: FirestoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

    this.app.endGame();

  }

  public onStart() {

    this.statesMissed = 50;
    this.time = AppService.GAME_TIME;
    this.statesMapData = {};
    this.state = GameState.InProgress;
    const data = this.app.startGame();

    data.timer.subscribe(time => {

      this.time = time;

    });
    data.updates.subscribe(data => {

      // Clear input (if not caused by speech recognition)
      if ( ! data.speech ) this.gameInput.nativeElement.value = '';

      // If game ended
      if ( data.update === UpdateState.GameOver ) {

        this.statesMapData = this.app.getCurrentStatesData();

        this.state = GameState.FinishedFailed;
        return;

      }
      else if ( data.update === UpdateState.GameWon ) {

        this.state = GameState.FinishedWon;
        return;

      }

      // If game update
      if ( data.update === UpdateState.Correct ) {

        this.correct = true;
        setTimeout(() => this.correct = false, 1000);
        this.statesMissed--;
        // Change the whole object to trigger change detection on app-map data-binding
        this.statesMapData = Object.assign({}, this.statesMapData, { [<string>data.stateName]: { ...data.mapData, named: true } })

      }
      else {

        this.identical = true;
        setTimeout(() => this.identical = false, 1000);

      }

    });

    setTimeout(() => this.gameInput.nativeElement.focus(), 100);

  }

  public onGameInputChange() {

    this.app.checkInput(this.gameInput.nativeElement.value.trim().toLowerCase());

  }

  public formatTime(time: number): string {

    return `${_.padStart(Math.floor(time / 60) + '', 2, '0')}:${_.padStart((time % 60) + '', 2, '0')}`;

  }

  public async onLeaderboardsSubmit(form: NgForm) {

    const nickname = form.value.nickname;
    const time = this.gameTime - this.time;

    form.reset();
    this.buttonsDisabled = true;

    try {

      await this.firestore.submitScore(nickname, time);

    }
    catch (error) {

      console.error(error);

      this.buttonsDisabled = false;
      return;

    }

    this.buttonsDisabled = false;

    this.router.navigate(['leaderboards']);

  }

  public onMicButtonClick() {

    this.app.startSpeechRecognition();

  }

}

enum GameState {

  Start = 'start',
  InProgress = 'in-progress',
  FinishedFailed = 'finished-failed',
  FinishedWon = 'finished-won'

}
