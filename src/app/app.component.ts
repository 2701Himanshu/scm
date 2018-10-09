import { Component, ViewChild, NgModule } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { HomePage } from '../pages/home/home';
import { TransactionsPage } from '../pages/transactions/transactions';
import { AboutPage } from '../pages/about/about';
import { CategoriesPage } from '../pages/categories/categories';
import { LoginPage } from '../pages/users/login';
import { SignupPage } from '../pages/users/signup';
import { ProfilePage } from '../pages/users/profile';
import {TranslateService} from '@ngx-translate/core';
import { Events } from 'ionic-angular';

import { FavoritesPage } from '../pages/favorites/favorites';
import { OfferPage } from '../pages/offer/offer';
import { OneSignal } from '@ionic-native/onesignal';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  base_url: any;
  user: Array<any>;
  stores: any = '';
  store: any = '';
  location: any;

  pages: Array<{ title: string, component: any, icon: any }>;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public http: Http,
    public events: Events,
    public storage: Storage,
    translate: TranslateService,
    public oneSignal: OneSignal,
    private alertCtrl: AlertController,
    ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    translate.setDefaultLang('en');

    this.base_url = Constant.domainConfig.base_url;

    this.http.get(this.base_url + 'api/stores_api/stores').subscribe(data => {
      this.storage.set('stores', data.json());
      this.stores = data.json();
      console.log("got stores", this.stores);
    })

    this.storage.get('location').then((obj) => {
      if (obj != null) {
        this.location = obj;
        console.log(obj, this.location);
      } else {
        console.log('no location');
        //this.presentAlert();
      }
    });

    this.pages = [
    { title: 'home', component: HomePage, icon: 'ios-home-outline' },
    { title: 'menu', component: CategoriesPage, icon: 'ios-list' },
    { title: 'offer', component: OfferPage, icon: 'ios-star-outline' },
    { title: 'favoriest', component: FavoritesPage, icon: 'ios-heart-outline' },
    //{ title: 'about', component: AboutPage, icon: 'ios-information-circle-outline' },
    // { title: 'Profile', component: ProfilePage, icon: 'ios-contact-outline' },
    // { title: 'Login', component: LoginPage, icon: 'ios-log-in-outline' },
    // { title: 'Logout', component: HomePage, icon: 'ios-log-out-outline' },
    // { title: 'Signup', component: SignupPage, icon: 'ios-power-outline' }
    ];

    this.user = new Array;

    this.events.subscribe('user: change', () => {
      this.storage.get('user').then((obj) => {
        console.log("user change request");
        this.user = new Array;
        if (obj == null) {
          this.user = null;
        } else {
          this.user = obj;
          this.nav.setRoot(ProfilePage);
   
        }

      });
    });

    this.events.subscribe('user: login', () => {

      this.nav.setRoot(HomePage);
      console.log("user login request");
      this.storage.get('user').then((obj) => {
        console.log(obj);
        this.user = new Array;
        if (obj == null) {
          this.user = null;
        } else {
          this.user = obj;
        }

        setTimeout(() => {    //<<<---    using ()=> syntax
          this.initializeApp();
        }, 1000);

      });
    });
    this.initializeApp();

  }

  initializeApp() {
    this.storage.get('user').then((obj) => {
      console.log("gor user obj",obj);
      this.user = new Array;
      if (obj == null) {
        this.user = null;
      } else {
        this.user = obj;
      }
    });

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleLightContent();
      this.statusBar.hide();

      this.splashScreen.hide();

      if (!this.platform.is('mobileweb') && !this.platform.is('core')) {
        this.oneSignal.startInit(Constant.onesignal_app_id, Constant.google_project_number);

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

        this.oneSignal.handleNotificationReceived().subscribe(() => {
          // do something when notification is received
        });

        this.oneSignal.handleNotificationOpened().subscribe(() => {
          // do something when a notification is opened
        });

        this.oneSignal.endInit();
      }
    });
  }

  logout(){
    this.storage.ready().then(() => {
      this.nav.setRoot(HomePage);
      this.storage.remove('user').then(success=>{
        this.events.publish('user: change');
        this.initializeApp();
      });
    });
  }

  openLogin(){
    this.nav.setRoot(LoginPage);
    // this.navCtrl.push(LoginPage);
  }

  presentLocationAlert() {


    let alert = this.alertCtrl.create({ cssClass: 'alertCustomCss' });
    alert.setTitle('Select Store Location');



    for (var i = 0; i < this.stores.length; i++) {
      if (i == 0)
        alert.addInput({ type: 'radio', label: this.stores[i].name, value: this.stores[i].value, checked: true });
      else
        alert.addInput({ type: 'radio', label: this.stores[i].name, value: this.stores[i].value });
    }
    //alert.addInput({ type: 'radio', label: 'Bondi Junction', value: 'Bondi Junction', checked: true });
    //alert.addInput({ type: 'radio', label: 'Circular Quay', value: 'CIRCULAR QUAY' });
    //alert.addInput({ type: 'radio', label: 'Gasworks', value: 'GASWORKS' });

    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Site:', data);
        this.storage.set("location", data);
        this.location = data;

        //this.first = -15;
        //this.list = new Array();
        this.openPage(this.pages[1]);
        this.setStores(data);
        //this.loadMore();
      }
    });
    alert.present();
    //processLocation();

    //let alert = this.alertCtrl.create({ cssClass: 'alertCustomCss'});
    //alert.setTitle('Select Store Location');
    //alert.addInput({ type: 'radio', label: 'Bondi Junction', value: 'Bondi Junction', checked: true });
    //alert.addInput({ type: 'radio', label: 'Circular Quay', value: 'CIRCULAR QUAY' });
    //alert.addInput({ type: 'radio', label: 'Gasworks', value: 'GASWORKS' });

    //alert.addButton({
    //  text: 'OK',
    //  handler: data => {
    //    console.log('Site:', data);
    //    this.storage.set("location", data);

    //    console.log('location changed ')
    //    this.events.publish('location_changed', data);

    //  }
    //});
    //alert.present();


    //processLocation();
  }

  setStores(store) {
    console.log("set store to ", store);
    this.storage.ready().then(() => {
      this.storage.get('stores').then((obj) => {
        for (var i = 0; i < obj.length; i++) {
          if (obj[i].value == store) {
            this.storage.set('store', obj[i]);
          }
        }
      });
    })
  }

  menuClosed() {
    console.log("closing from menu");
    this.events.publish('menu:closed', '');

    let x = document.getElementById('nav-icon1');
    if(x)
      x.removeAttribute('class')

    //if (x.getAttribute('class')) {
    //  x.removeAttribute('class')
    //} else {
    //  x.setAttribute('class', 'open')
    //}
    
  }

  menuOpened() {
    console.log("opning from menu");
    this.events.publish('menu:opened', '');

    let x = document.getElementById('nav-icon1');
    if (x)
      x.setAttribute('class', 'open')

    //if (x.getAttribute('class')) {
    //  x.removeAttribute('class')
    //} else {
    //  x.setAttribute('class', 'open')
    //}

  }

  //menubtn() {
  //  if (this.visible)
  //    this.visible = false;
  //  else
  //    this.visible = true;

  //  console.log("menubtn ", this.visible);
  //}

  openProfile(){
    this.nav.setRoot(ProfilePage);
    // this.navCtrl.push(LoginPage);
  }

  openTransactions(){
    this.nav.setRoot(TransactionsPage);
    // this.navCtrl.push(LoginPage);
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

}
