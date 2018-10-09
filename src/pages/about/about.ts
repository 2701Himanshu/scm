import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CallNumber } from '@ionic-native/call-number';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  obj: any='';
  private form_contact : FormGroup;

  constructor(public navCtrl: NavController,
    public iab: InAppBrowser,
    public navParams: NavParams,
    public http: Http, 
    public callNumber:CallNumber,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    public menuCtrl: MenuController,
    public storage: Storage) {
    
    this.http.get(Constant.domainConfig.base_url+'api/settings_api/settings').subscribe(data=>{
      this.obj = data.json();
      console.log(data.json());
    })

    this.form_contact = this.formBuilder.group({
      full_name: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(60), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: ['', Validators.compose([Validators.maxLength(60), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      message: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(200), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
    });
  }

  nav_more(url){
    let  browser = this.iab.create(url);
  }

  send_message(){
  	// alert(this.form_contact.value.full_name);
    let full_name = this.form_contact.value.full_name;
    let email = this.form_contact.value.email;
    let message = this.form_contact.value.message;

    let headers:Headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    let lst_data = 'full_name='+full_name+'&email='+email+'&message='+message;
    
    if(full_name!=null && email!=null && message!=null && full_name!='' && email!='' && message!=''){
      this.http.post(Constant.domainConfig.base_url+'api/contact_api/contact',lst_data,{headers:headers}).subscribe(data=>{
        if(data.json() != null){
          let alert=this.alertCtrl.create({
            'message':'Message sent to success',
            buttons: [{
              text: 'Ok',
              role: 'cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            }]
          })
          alert.present();
        }
      });
    }
  }

  facebook(){
     let  browser = this.iab.create(this.obj.facebook);
  }

  twitter(){
     let  browser = this.iab.create(this.obj.twitter);
  }


  call() {
    setTimeout(() => {
      let tel = this.obj.phone;//'12345678890';
      window.open(`tel:${tel}`, '_system');
    }, 100);
    //this.callNumber.callNumber(this.settings.phone,true);
  }

  menubtn() {
    this.menuCtrl.open();
    
  }

}
