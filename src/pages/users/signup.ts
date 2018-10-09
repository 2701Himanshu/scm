import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import  * as Constant from '../../config/constants';

import { Http, Headers } from '@angular/http';

import {EmailValidator} from '../../validators/email';
import {PhoneValidator} from '../../validators/phone';
import {UserNameValidator} from '../../validators/username';
import { PasswordValidator } from '../../validators/password';
import { MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-users',
  templateUrl: 'signup.html'
})
export class SignupPage {

  base_url: any = '';
  user_name: any = '';
  password: any = '';
  msg_err: any = null;
  form:FormGroup;

  constructor(public http: Http, public menuCtrl: MenuController, public toastCtrl: ToastController, public navCtrl: NavController, public alertCtrl: AlertController, public formBuilder: FormBuilder, public navParams: NavParams, public storage: Storage, public events: Events,) {
    this.base_url=Constant.domainConfig.base_url;

    this.form = formBuilder.group({
      full_name: ['',Validators.compose([Validators.minLength(5),Validators.maxLength(50),Validators.pattern('[a-zA-Z ]*'),Validators.required])],
      user_name: ['',Validators.compose([UserNameValidator.isValid,Validators.minLength(5),Validators.maxLength(50)])],
      email: ['',Validators.compose([EmailValidator.isValid,Validators.required])],
      phone:['', PhoneValidator.isValid],
      address:['',Validators.compose([Validators.minLength(5),Validators.maxLength(200),Validators.required])],
      pwd:['',Validators.compose([Validators.minLength(5),Validators.maxLength(50)])],
      repwd:['',PasswordValidator.isMatch],
      send_code_method:['1']
    });
  }


  signup(){
    let signup_url='';
    if(this.form.value.send_code_method==0){
      //if SMS method
      signup_url=this.base_url+'api/users_api/check_sms_register_valid';
    }else{
      //if mail method
      signup_url = this.base_url +'api/users_api/register';
    }

    let headers:Headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let data='user_name='+this.form.value.user_name+
    '&full_name='+this.form.value.full_name+
    '&email='+this.form.value.email+
    '&address='+this.form.value.address+
    '&pwd='+this.form.value.pwd+'&phone='+this.form.value.phone;

    //alert(data);

    this.http.post(signup_url,data,{headers:headers}).subscribe(data=>{
      console.log(data);
      let jsonData=data.json();
      if(jsonData.success==3){
        //if success go to verification page
        let alertCtrl = this.alertCtrl.create({
          title: 'Please enter your verification code',
          enableBackdropDismiss:false,
          inputs: [{
            name: 'code',
            placeholder: 'verification code'
          }],
          buttons: [{
            text: 'Cancel',
            handler:data=>{
              let post_data='email='+this.form.value.email;
              this.http.post(this.base_url+'api/users_api/cancel_register',post_data,{headers:headers}).subscribe(data=>{
                this.navCtrl.pop();
              })
            }
          },
          {
            text: 'Resend',
            handler: data => {
              let post_data='email='+this.form.value.email+'&phone='+this.form.value.phone+'&send_code_method='+this.form.value.send_code_method;
              this.http.post(this.base_url+'api/users_api/resend_verified_code',post_data,{headers:headers}).subscribe(data=>{

              })
            }
          },
          {
            text: 'Submit',
            handler: data => {
              let post_data='code='+data.code+'&email='+this.form.value.email;
              this.http.post(this.base_url+'api/users_api/register',post_data,{headers:headers}).subscribe(data=>{
                if(data.json().success==1){
                  //register done
                  let confirmCtl= this.alertCtrl.create({
                    message:'Signup Successfully, Login now !!!',
                    buttons:[{
                      text: 'Ok',
                      handler: () => {
                        alertCtrl.dismiss();
                        console.log("autologin");
                        this.login();
                        this.navCtrl.pop();
                      }
                    }]
                  });
                  confirmCtl.present();
                }else{
                  //register failed
                  let toastCtrl=this.toastCtrl.create({
                    message:'your confirm code wrong, pls try again',
                    duration: 3000,
                    position: 'top'
                  })
                  toastCtrl.present();
                }//end if else
              });
              return false;
            }
          }]
        });
        //alertCtrl.present();
      }

      if(jsonData.success==1){
        let alertCtrl=this.alertCtrl.create({
          message:'UserName exist, try another !!',
          buttons: ['Dismiss']
        })
        alertCtrl.present();
      }

      if (jsonData.success == 3) {
        let confirmCtl = this.alertCtrl.create({
          message: 'Signup Successfully, Login now !!!',
          buttons: [{
            text: 'Ok',
            handler: () => {
              //alertCtrl.dismiss();
              console.log("autologin");
              this.login();
              //this.navCtrl.pop();
            }
          }]
        });
        confirmCtl.present();
      }

      if(jsonData.success==0){
        let alertCtrl=this.alertCtrl.create({
          message:'Email exist, try another !!',
          buttons: ['Dismiss']
        })
        alertCtrl.present();
      }

      if(jsonData.success==2){
        let alertCtrl=this.alertCtrl.create({
          message:'Phone exist, try another !!',
          buttons: ['Dismiss']
        })
        alertCtrl.present();
      }
    },error=>{
      console.log(error);
    })
  }

  login() {
    this.user_name = this.form.value.user_name;
    this.password = this.form.value.pwd;

    if (this.user_name != null && this.user_name != '' && this.password != null && this.password != '') {
      let headers: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      this.http.post(this.base_url + 'api/users_api/login', 'user_name=' + this.user_name + '&pwd=' + this.password, { headers: headers }).subscribe(data => {
        console.log(data.json());
        if (data.json().empty == null) {
          console.log("setting user");
          let user = data.json()[0];
          this.storage.set('user', user);
          this.events.publish('user: change');
          this.events.publish('user: login');
        } else {
          this.msg_err = 'Your username or password is wrong';
        }
      }, error => {

      })
    } else {
      this.msg_err = 'You enter not enough information';
    }
  }

  menubtn() {
    this.menuCtrl.open();
  }
  
}
