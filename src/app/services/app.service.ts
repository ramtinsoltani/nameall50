import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private statesData: StatesData = {
    alabama: { named: false, mapId: 'AL', mapExt: false },
    alaska: { named: false, mapId: 'AK', mapExt: false },
    arizona: { named: false, mapId: 'AZ', mapExt: false },
    arkansas: { named: false, mapId: 'AR', mapExt: false },
    california: { named: false, mapId: 'CA', mapExt: false },
    colorado: { named: false, mapId: 'CO', mapExt: false },
    connecticut: { named: false, mapId: 'CT', mapExt: true },
    delaware: { named: false, mapId: 'DE', mapExt: true },
    florida: { named: false, mapId: 'FL', mapExt: false },
    georgia: { named: false, mapId: 'GA', mapExt: false },
    hawaii: { named: false, mapId: 'HI', mapExt: false },
    idaho: { named: false, mapId: 'ID', mapExt: false },
    illinois: { named: false, mapId: 'IL', mapExt: false },
    indiana: { named: false, mapId: 'IN', mapExt: false },
    iowa: { named: false, mapId: 'IA', mapExt: false },
    kansas: { named: false, mapId: 'KS', mapExt: false },
    kentucky: { named: false, mapId: 'KY', mapExt: false },
    louisiana: { named: false, mapId: 'LA', mapExt: false },
    maine: { named: false, mapId: 'ME', mapExt: false },
    maryland: { named: false, mapId: 'MD', mapExt: true },
    massachusetts: { named: false, mapId: 'MA', mapExt: true },
    michigan: { named: false, mapId: 'MI', mapExt: false },
    minnesota: { named: false, mapId: 'MN', mapExt: false },
    mississippi: { named: false, mapId: 'MS', mapExt: false },
    missouri: { named: false, mapId: 'MO', mapExt: false },
    montana: { named: false, mapId: 'MT', mapExt: false },
    nebraska: { named: false, mapId: 'NE', mapExt: false },
    nevada: { named: false, mapId: 'NV', mapExt: false },
    'new hampshire': { named: false, mapId: 'NH', mapExt: true },
    'new jersey': { named: false, mapId: 'NJ', mapExt: true },
    'new mexico': { named: false, mapId: 'NM', mapExt: false },
    'new york': { named: false, mapId: 'NY', mapExt: false },
    'north carolina': { named: false, mapId: 'NC', mapExt: false },
    'north dakota': { named: false, mapId: 'ND', mapExt: false },
    ohio: { named: false, mapId: 'OH', mapExt: false },
    oklahoma: { named: false, mapId: 'OK', mapExt: false },
    oregon: { named: false, mapId: 'OR', mapExt: false },
    pennsylvania: { named: false, mapId: 'PA', mapExt: false },
    'rhode island': { named: false, mapId: 'RI', mapExt: true },
    'south carolina': { named: false, mapId: 'SC', mapExt: false },
    'south dakota': { named: false, mapId: 'SD', mapExt: false },
    tennessee: { named: false, mapId: 'TN', mapExt: false },
    texas: { named: false, mapId: 'TX', mapExt: false },
    utah: { named: false, mapId: 'UT', mapExt: false },
    vermont: { named: false, mapId: 'VT', mapExt: true },
    virginia: { named: false, mapId: 'VA', mapExt: false },
    washington: { named: false, mapId: 'WA', mapExt: false },
    'west virginia': { named: false, mapId: 'WV', mapExt: false },
    wisconsin: { named: false, mapId: 'WI', mapExt: false },
    wyoming: { named: false, mapId: 'WY', mapExt: false }
  };
  private timer!: NodeJS.Timeout;
  private timerSubject!: Subject<number>;
  private gameSubject!: Subject<GameUpdate>;
  private gameInProgress: boolean = false;
  private timeRemaining: number = AppService.GAME_TIME; // In seconds
  private SpeechRecognition = window.SpeechRecognition || (<any>window)['webkitSpeechRecognition'];
  private SpeechGrammarList = window.SpeechGrammarList || (<any>window)['webkitSpeechGrammarList'];
  private speech!: SpeechRecognition;

  public isSpeechSupported = this.SpeechRecognition && this.SpeechGrammarList;
  public speechStarted: boolean = false;
  public static GAME_TIME = 240;

  constructor() {

    // If not supported
    if ( ! this.isSpeechSupported ) return;

    this.speech = new this.SpeechRecognition();

    // Define grammar (all state names)
    const words = Object.keys(this.statesData);
    const grammar = `#JSGF V1.0; grammar states; public <state> = ${words.join(' | ')} ;`;
    const speechList = new this.SpeechGrammarList();
    speechList.addFromString(grammar, 1);

    // Configure speech recognition
    this.speech.grammars = speechList;
    this.speech.continuous = true;
    this.speech.lang = 'en-US';
    this.speech.interimResults = false;
    this.speech.maxAlternatives = 1;

    // Results handler
    this.speech.onresult = event => {

      const results = event.results.item(event.resultIndex).item(0).transcript.trim().toLowerCase();

      for ( const word of words ) {

        // Fix for 'west virginia' also selecting 'virginia'
        if ( word === 'virginia' && results.includes(word) ) {

          // Get all indices of 'virginia'
          const indices = [];
          let lastIndex = -1;

          while ( (lastIndex = results.indexOf(word, lastIndex + 1)) >= 0 ) {

            indices.push(lastIndex);

          }

          // Qualify if an occurrence is not preceded by 'west '
          for ( const index of indices ) {

            if ( results.substr(index - 5, 5) !== 'west ' ) {

              this.checkInput(word);
              break;

            }

          }

        }
        else if ( results.includes(word) ) this.checkInput(word);

      }

    };

    this.speech.onend = () => {

      this.speechStarted = false;

      if ( this.gameInProgress ) this.startSpeechRecognition();

    };

  }

  public startGame(): GameData {

    // Restart states data
    for ( const state in this.statesData ) {

      this.statesData[state].named = false;

    }

    // Init
    this.gameSubject = new Subject<GameUpdate>();
    this.timerSubject = new Subject<number>();

    // Create new timer
    this.timer = setInterval(() => this.timerSubject.next(--this.timeRemaining), 1000);

    // End game when timer reaches zero
    this.timerSubject.subscribe(time => {

      if ( time === 0 ) {

        this.endGame();

      }

    });

    this.gameInProgress = true;

    return { updates: this.gameSubject, timer: this.timerSubject };

  }

  public checkInput(input: string): void {

    if ( ! this.gameInProgress ) throw new Error('Game is not in progress!');

    if ( this.statesData.hasOwnProperty(input) ) {

      if ( this.statesData[input].named ) {

        this.gameSubject.next({
          update: UpdateState.Identical,
          stateName: input
        });

      }
      else {

        this.statesData[input].named = true;
        this.gameSubject.next({
          update: UpdateState.Correct,
          stateName: input,
          mapData: { mapId: this.statesData[input].mapId, mapExt: this.statesData[input].mapExt }
        });

        // If all named
        if ( Object.values(this.statesData).map(s => s.named).reduce((a, b) => a && b) ) {

          this.endGame(true);

        }

      }

    }

  }

  public endGame(won?: boolean): void {

    if ( ! this.gameInProgress ) return;

    if ( this.isSpeechSupported && this.speechStarted ) this.speech.stop();

    this.gameSubject.next({ update: won ? UpdateState.GameWon : UpdateState.GameOver });

    // Clear timer and subjects
    clearTimeout(this.timer);
    this.timerSubject.unsubscribe();
    this.gameSubject.unsubscribe();
    this.timeRemaining = AppService.GAME_TIME;
    this.gameInProgress = false;

  }

  public getCurrentStatesData(): StatesData {

    return _.cloneDeep(this.statesData);

  }

  public startSpeechRecognition() {

    if ( this.speechStarted || ! this.gameInProgress ) return;

    // If not supported
    if ( ! this.isSpeechSupported ) {

      console.warn('Speech recognition is not supported!');
      return;

    }

    // Start
    this.speech.start();
    this.speechStarted = true;

  }

}

export interface StatesData {

  [stateName: string]: {
    named: boolean;
    mapId: string;
    mapExt: boolean;
  };

}

export enum UpdateState {

  Correct,
  Identical,
  GameOver,
  GameWon

}

export interface GameUpdate {

  update: UpdateState;
  stateName?: string;
  mapData?: { mapId: string; mapExt: boolean; };

}

export interface GameData {

  updates: Subject<GameUpdate>;
  timer: Subject<number>;

}
