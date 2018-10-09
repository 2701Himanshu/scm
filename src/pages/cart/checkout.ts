import { Component } from '@angular/core';
import { NavController, NavParams, ToastController,LoadingController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { Stripe } from '@ionic-native/stripe';
import { Events } from 'ionic-angular';


import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';

@Component({
  selector: 'page-cart',
  templateUrl: 'checkout.html'
})
export class CheckoutPage {
  total:any;
  full_name: string='';
  phone: string='';
  address: string='';
  message: string='';
  pay_method:number;
  email:string='';

  user_id: any='';

  delivery: boolean = false;

  /*this card info just for test, pls set it to empty string when your app go online */
  card_info: any = {
    number: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  }
  carts:any='';
  settings:any='';
  validate:boolean=true;
  stores: any = '';
  store: any = '';
  location: any;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public payPal: PayPal,
    public http: Http, 
    public storage: Storage, 
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public toastCtrl:ToastController, 
    public stripe:Stripe,
    public events: Events,
    public menuCtrl: MenuController,
    public loadingCtrl:LoadingController,
    private alertCtrl: AlertController) {

    //pay on delivery;
    this.pay_method=1;
    this.total=this.navParams.get('total');
    this.storage.ready().then(() => {
      this.storage.get('carts').then(data=>{
        this.carts=data;
      })

      this.storage.get('store').then(data => {
        this.store = data;
        console.log("store", this.store);
      })

      this.storage.get('settings').then(data=>{
        this.settings=data;
      })
      this.storage.get('location').then(data => {
        this.location = data;
      })
    })

    this.storage.get('delivery').then(data => {
      this.delivery = data;
      console.log("delivery is ", this.delivery);
    })

    this.events.subscribe('user: change', () => {
      this.ionViewWillEnter();
    });

  }

  ionViewWillEnter(){ 
    this.storage.get('user').then((obj) => {
      console.log(obj);
      if (obj == null) {
        this.user_id = null;
      }else{
        this.user_id = obj.id;
        this.full_name = obj.full_name;
        this.phone = obj.phone;
        this.email = obj.email;
      }
    });
  }

  order_now(){
    this.stripe.setPublishableKey(Constant.stripe_publish_key);
    this.stripe.createCardToken(this.card_info).then((token) => {

      if(this.user_id==null){
        if(this.full_name.length < 5 || this.full_name.length > 50){
          this.validate=false;
          return;
        }

        if(this.phone.length < 10 || this.phone.length > 50){
          this.validate=false;
          return;
        }
      }
if(this.delivery != true){
  // if(this.address.length < 5 || this.address.length > 50){
  //   this.validate=false;
  //   return;
  // }
}


      if(this.message.length > 500){
        this.validate=false;
        return;
      }

      if(this.user_id==null){
        if(this.email.length < 5 || this.email.length > 50){
          this.validate=false;
          return;
        }
      }

      this.validate = true;
      let data = 'email=' + this.email + '&store=' + this.location + '&total=' + this.total + '&token=' + token['id'] + '&full_name=' + this.full_name + '&phone=' + this.phone + '&address=' + this.address + '&message=' + this.message + '&items=' + JSON.stringify(this.carts);
      //let data = 'email=' + this.email + '&total=' + this.total + '&token=' + token['id'] + '&full_name=' + this.full_name + '&phone=' + this.phone + '&address=' + this.address + '&message=' + this.message + '&items=' + JSON.stringify(this.carts);

      this.post(data);
    }).catch(error => {
      let alert = this.alertCtrl.create({
        'message': error
      })
      alert.present();
    });
  }

  order_on_paypal(){
    if(this.user_id==null){
      if(this.full_name.length < 5 || this.full_name.length > 50){
        this.validate=false;
        return;
      }

      if(this.phone.length < 10 || this.phone.length > 50){
        this.validate=false;
        return;
      }
    }

    if(this.address.length < 5 || this.address.length > 50){
      this.validate=false;
      return;
    }

    if(this.message.length > 500){
      this.validate=false;
      return;
    }

    if(this.user_id==null){
      if(this.email.length < 5 || this.email.length > 50){
        this.validate=false;
        return;
      }
    }

    this.validate=true;
    if(this.validate==true){
      this.payPal.init({
        PayPalEnvironmentProduction: Constant.paypal_live_client_id,
        PayPalEnvironmentSandbox: Constant.paypal_sandbox_client_id
      }).then(() => {
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        })).then(() => {
          let payment = new PayPalPayment(this.total,this.settings.currency_code, 'Buy Pizza', 'sale');
          this.payPal.renderSinglePaymentUI(payment).then(() => {
            let data = 'email=' + this.email + "&store=" + this.location + '&total=' + this.total + '&full_name=' + this.full_name + '&user_id=' + this.user_id + '&phone=' + this.phone + '&address=' + this.address + '&message=' + this.message + '&items=' + JSON.stringify(this.carts);
            //let data = 'email=' + this.email + '&total=' + this.total + '&full_name=' + this.full_name + '&user_id=' + this.user_id + '&phone=' + this.phone + '&address=' + this.address + '&message=' + this.message + '&items=' + JSON.stringify(this.carts);

            this.post(data);
          }, () => {
          });
        }, () => {
        });
      }, () => {
      });
    }
  }

  order_on_delivery(){
    if(this.user_id==null){
      if(this.full_name.length < 5 || this.full_name.length > 50){
        this.validate=false;
        return;
      }

      if(this.phone.length < 10 || this.phone.length > 50){
        this.validate=false;
        return;
      }
    }

    // if(this.address.length < 5 || this.address.length > 50){
    //   this.validate=false;
    //   return;
    // }

    if(this.delivery == false){
      this.address = "Pick up from store";
      // if(this.address.length < 5 || this.address.length > 50){
      //   this.validate=false;
      //   return;
      // }
    }

    if(this.message.length > 500){
      this.validate=false;
      return;
    }

    if(this.user_id==null){
      if(this.email.length < 5 || this.email.length > 50){
        this.validate=false;
        return;
      }
    }

    this.validate = true;
    let data = 'email=' + this.email + "&store=" + this.location + '&total=' + this.total + '&full_name=' + this.full_name + '&user_id=' + this.user_id + '&phone=' + this.phone + '&address=' + this.address + '&message=' + this.message + '&items=' + JSON.stringify(this.carts);

    this.post(data);
  }

  post(data){
    let loader = this.loadingCtrl.create({
      content: 'Taking order, wait a minute'
    })
    loader.present();
    let headers:Headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    this.http.post(
      Constant.domainConfig.base_url+'api/orders_api/add_order',
      data,
      {headers:headers}).subscribe(data=>{
        if(data.json().success==0){
          let alert=this.alertCtrl.create({
            'message':'Error while ordering, pls try again'
          });
          alert.present();
        }else{
          this.storage.set('carts', new Array());
          let alert=this.alertCtrl.create({
            'message':'Order has been successfully placed. <br> Wish you good appetite.',
            buttons: [{
              text: 'Ok',
              role: 'cancel',
              handler: data => {
                this.navCtrl.pop();
              }
            }]
          })
          loader.dismiss();
          alert.present();
        }
      },error=>{
        loader.dismiss();
      })
    }

    order(){
      if(this.pay_method==0){
        this.order_on_delivery();
      }
      if(this.pay_method==1){
        this.order_now();
      }
      if(this.pay_method==2){
        this.order_on_paypal();
      }
    }

    cancel(){
      this.navCtrl.pop();
    }

    facebook(){
      let  browser = this.iab.create(this.settings.facebook);
    }

    twitter(){
      let  browser = this.iab.create(this.settings.twitter);
    }

  call() {
    setTimeout(() => {
      let tel = this.settings.phone;//'12345678890';
      window.open(`tel:${tel}`, '_system');
    }, 100);
    //this.callNumber.callNumber(this.settings.phone,true);
  }

  menubtn() {
    this.menuCtrl.open();
    
  }
  }
