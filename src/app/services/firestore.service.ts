import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor() {

    firebase.initializeApp({
      apiKey: "AIzaSyBTCIZoz3cPd1FnuvZxI0I8CY_GP5uGsgM",
      authDomain: "nameall50.firebaseapp.com",
      databaseURL: "https://nameall50.firebaseio.com",
      projectId: "nameall50",
      storageBucket: "nameall50.appspot.com",
      messagingSenderId: "102254245336",
      appId: "1:102254245336:web:651bddf062efe3587e2ead"
    });

    firebase.auth().signInAnonymously()
    .catch(error => console.error(error));

  }

  public async submitScore(name: string, time: number) {

    if ( ! firebase.auth().currentUser ) throw new Error('Not signed in!');

    await firebase.firestore().collection('leaderboards').add({ name, time });

  }

  public getLeaderboards() {

    return new Observable<firebase.firestore.QuerySnapshot>(observer => firebase.firestore().collection('leaderboards').orderBy('time', 'asc').limit(25).onSnapshot(observer));

  }

}
