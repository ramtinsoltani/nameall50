import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from '@app/service/firestore';
import { Subscription } from 'rxjs';
import _ from 'lodash-es';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.scss']
})
export class LeaderboardsComponent implements OnInit, OnDestroy {

  public leaderboardsData: any[] = [];
  private sub!: Subscription;

  constructor(
    private firestore: FirestoreService
  ) { }

  ngOnInit(): void {

    this.sub = this.firestore.getLeaderboards().subscribe(snapshot => {

      this.leaderboardsData = snapshot.docs.map(doc => doc.data());

    });

  }

  ngOnDestroy(): void {

    if ( this.sub ) this.sub.unsubscribe();

  }

  public formatTime(time: number): string {

    return `${_.padStart(Math.floor(time / 60) + '', 2, '0')}:${_.padStart((time % 60) + '', 2, '0')}`;

  }

}
