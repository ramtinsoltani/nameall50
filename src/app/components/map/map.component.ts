import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnChanges {

  private floridaCounter: number = 0;
  private floridaTimer!: NodeJS.Timer;
  @Input('data-map') public map: any;

  constructor() { }

  ngOnChanges(): void {

    // If map is empty, then restart
    if ( ! Object.keys(this.map).length ) {

      document.querySelectorAll('.show').forEach(e => e.classList.remove('show'));
      document.querySelectorAll('.named').forEach(e => e.classList.remove('named'));
      document.querySelectorAll('.unnamed').forEach(e => e.classList.remove('unnamed'));

      return;

    }

    for ( const state in this.map ) {

      (<HTMLElement>document.getElementById(`${this.map[state].mapId}-name`)).classList.add('show');
      (<HTMLElement>document.getElementById(this.map[state].mapId)).classList.add(this.map[state].named ? 'named' : 'unnamed');

      if ( this.map[state].mapExt )
        (<HTMLElement>document.getElementById(`${this.map[state].mapId}-ext`)).classList.add(this.map[state].named ? 'named' : 'unnamed');

    }

  }

  onFloridaClicked() {

    if ( this.floridaTimer ) clearTimeout(this.floridaTimer);

    this.floridaCounter++;

    if ( this.floridaCounter === 10 ) {

      window.location.href = 'https://www.reddit.com/r/FloridaMan/';

      return;

    }

    this.floridaTimer = setTimeout(() => this.floridaCounter = 0, 3000);

  }

}
