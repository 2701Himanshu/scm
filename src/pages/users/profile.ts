import { NavController, NavParams } from 'ionic-angular';
import { Component, ViewChild, NgModule } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';


import {TranslateService} from '@ngx-translate/core';
import { Events } from 'ionic-angular';
import { OneSignal } from '@ionic-native/onesignal';

import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-users',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  base_url: any='';
  user: any='';
  user_id: any='';

  avatar: any;
  full_name: any;
  phone: any;
  address: any;
  old_pwd: any;
  new_pwd: any;
  confirm_pwd: any;
  check_edit: any=false;
  msg_err_edit: any;
  msg_err_pwd: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public http: Http,
    public events: Events,
    public storage: Storage,
    public menuCtrl: MenuController,
    translate: TranslateService,
    public oneSignal:OneSignal
  ) {
    this.base_url = Constant.domainConfig.base_url;

    this.events.subscribe('user: change', () => {
       this.ionViewWillEnter();
    });
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter ProfilePage');
    this.storage.get('user').then((obj) => {
      console.log(obj);
      this.user = new Array;
      if (obj == null) {
        this.user = null;
      }else{
        this.user = obj;
        this.user_id = obj.id;
        this.full_name = obj.full_name;
        this.phone = obj.phone;
        this.address = obj.address;
      }
    });
  }

  update_profile(){
    alert(this.user_id);
    let reg = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
    if(
      this.full_name.length >= 5 &&
      this.full_name.length <= 60 &&

      reg.test(this.phone) == true &&

      this.address.length >= 5 &&
      this.address.length <= 250
      ){
      let headers:Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      this.http.post(this.base_url+'api/users_api/update','id='+this.user_id+'&full_name='+this.full_name+'&phone='+this.phone+'&address='+this.address,{headers:headers}).subscribe(data=>{
        console.log(data.json());
        if(data.json().ok == 0){
          this.msg_err_edit = 'You enter a missing or incorrect input 2';
        }else{
          let user = data.json()[0];
          this.storage.remove('user').then(success=>{
            
          });
          this.storage.set('user', user);
          this.msg_err_edit = 'Update Profile successfully';
        }
      },error=>{ })
    }else{
      this.msg_err_edit = 'You enter a missing or incorrect input 1';
    }
  }
  
  change_pwd(){
    let reg = /^[a-zA-Z0-9]+$/;

    if(this.old_pwd != null && this.new_pwd != null &&  this.new_pwd == this.confirm_pwd && this.new_pwd.length <= 60 && this.new_pwd.length >= 5 && reg.test(this.new_pwd) == true){
      let headers:Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      this.http.post(this.base_url+'api/users_api/pwd','id='+this.user_id+'&old_pass='+this.old_pwd+'&new_pass='+this.new_pwd,{headers:headers}).subscribe(data=>{
        console.log(data.json());
        if(data.json().ok == 1){
          this.msg_err_pwd = 'Change password successfully';
          this.old_pwd = null;
          this.new_pwd = null;
          this.confirm_pwd = null;
        }else{
          this.msg_err_pwd = 'Your username or password is wrong';
        }
      },error=>{

      })
    }else{
      this.msg_err_pwd = 'You enter a missing or incorrect input';
    }
  }

  menubtn() {
    this.menuCtrl.open();

  }
}


