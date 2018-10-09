import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import * as Constant from '../../config/constants';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { HomePage } from '../home/home';
import { SignupPage } from '../users/signup';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-users',
  templateUrl: 'login.html'
})
export class LoginPage {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  base_url: any = '';
  user_name: any = '';
  password: any = '';
  msg_err: any = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public http: Http,
    public menuCtrl: MenuController,
    public storage: Storage,
    public fb: Facebook
  ) {
    this.base_url = Constant.domainConfig.base_url;
    //this.fb.browserInit(Constant.fb_app, Constant.fb_v);

    //ionic.Platform.ready(function() {
    //  facebookConnectPlugin.browserInit(appID, appVersion);
    //});
    
  }
    
  login() {
    if (this.user_name != null && this.user_name != '' && this.password != null && this.password != '') {
      let headers: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      this.http.post(this.base_url + 'api/users_api/login', 'user_name=' + this.user_name + '&pwd=' + this.password, { headers: headers }).subscribe(data => {
        console.log(data.json());
        if (data.json().empty == null) {
          let user = data.json()[0];
          this.storage.set('user', user);
          this.events.publish('user: change');
          this.events.publish('user: login');
        }else {
          this.msg_err = 'Your username or password is wrong';
        }
      }, error => {

      })
    } else {
      this.msg_err = 'You enter not enough information';
    }
  }



  fb_login() {
    this.fb.login(['public_profile', 'email'])
    .then((res: FacebookLoginResponse) => {
      let params = new Array<string>();
      this.fb.api('/me?fields=name,gender,email', params).then(user => {
        console.log(JSON.stringify(user));
        this.http.get(this.base_url + 'api/users_api/facebook_user_check?fb_id=' + user.id).subscribe(data => {
          //check user facebook
          if (data.json().success == 0) {
            //if do not have user, insert it 
            let headers: Headers = new Headers({
              'Content-Type': 'application/x-www-form-urlencoded'
            });

            let username = user.email.substring(0, user.email.indexOf("@"));
            //console.log(username.substring(0,4));
            username = username.substring(0, 4) + '_' + user.id;

            let params = 'fb_id=' + user.id + '&email=' + user.email + '&fullname=' + user.name + '&user_name=' + username;
            this.http.post(this.base_url + 'api/users_api/facebook_user_register', params, { headers: headers }).subscribe(data => {
              console.log(JSON.stringify(data));
              let user = data.json();
              user = user[0];
              this.storage.set('user', user);
              this.events.publish('user: change');
              //this.nav.setRoot(HomePage);
            }, error => {
              console.log(error);
            })
          } else {
            let user = data.json().data[0];
            this.storage.set('user', user);
            this.events.publish('user: change');
           // this.nav.setRoot(HomePage);
          }
        }, error => {
        })

      }).catch(e => {
        alert("Facebook login failed, try again !!!" + JSON.stringify(e));
      })
    })
    .catch(e => {
      alert("Facebook login failed, try again !!!" + JSON.stringify(e));
    });
  }



  signup(){
    this.navCtrl.push(SignupPage);
  }

  menubtn() {
    this.menuCtrl.open();
    
  }
}
