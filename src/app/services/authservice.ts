import { Injectable, NgZone } from '@angular/core';
import { User } from "./user";
// import auth from '@firebase/app/compat';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any; // Save logged in user data

  password : any;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,  
    public ngZone: NgZone // NgZone service to remove outside scope warning
    
  ) {  
    this.password = "Pass@123";  
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')  || '{}');

        console.log("useer isss",this.userData);
      } else {
        localStorage.setItem('user', '');
        JSON.parse(localStorage.getItem('user')  || '{}');
        // console.log("useer isss NOT",this. );
      }
    })
  }

  // Sign in with email/password
  SignIn(password : any) {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    alert(email);
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        // this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Sign up with email/password
  SignUp(dukaName :any, phone :any,email :any) {
    
    return this.afAuth.createUserWithEmailAndPassword(email, this.password)
      .then((result : any) => {
        result.user.dukaName = dukaName;
        result.user.phone = phone;
        this.SetUserData(result.user);
        this.ngZone.run(() => {
          this.router.navigate(['sign-in']);
        });
      }).catch((error : any) => {
        window.alert(error.message)
      })
  }


  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("logged in:", user)
    return (user !== null) ? true : false;
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user : any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    
    const userData: User = {
      uid: user.uid,
      dukaName : user.dukaName,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified
    }
    console.log("Json data",JSON.parse(localStorage.getItem('user') || '{}').uid);
    return userRef.set(userData, {
      merge: true
    })
  } 

  // Sign out 
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['register-user']);
    })
  }

}