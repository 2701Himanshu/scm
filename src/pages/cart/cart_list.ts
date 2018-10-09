import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { CheckoutPage } from './checkout';
import { SearchPage } from '../search/search';

import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-cart',
  templateUrl: 'cart_list.html'
})
export class CartListPage {
  base_url: any;
  total_card: number;
  list: any;
  tax: any;
  ship_fee: any;
  pay: any;
  settings: any ='';
  stores: any = '';
  store: any = '';
  location: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public storage: Storage,
    public menuCtrl: MenuController,
    private alertCtrl: AlertController,
    public toastCtrl:ToastController) {

    this.base_url = Constant.domainConfig.base_url;
    this.pay = new Array();

    this.storage.get('store').then(data => {
      this.store = data;
      console.log("store", this.store);
    })

  }

  ionViewWillEnter(){
    this.storage.ready().then(() => {
      this.storage.get('settings').then(data=>{
        this.settings=data;
      })
      this.storage.get('carts').then((data)=>{
        this.list = data;
        let products_price = 0;

        for(var i in this.list){
          products_price = products_price + this.list[i].total_price * this.list[i].quantity;
          //products_price = Math.round(products_price);
        };
        console.log("proce is ", products_price);

        let ship: number = 0;
        ship=parseFloat(this.settings.ship_fee);
        //let tota: number=0;
        //tota = parseFloat(this.settings.tax) / 100 * (parseFloat(products_price) + parseFloat(products_price) + ship) ;

        let tota = 0;
        tota = parseFloat(this.settings.tax) / 100;
        tota = tota * (products_price + parseFloat(this.settings.ship_fee));
        tota = tota + products_price + parseFloat(this.settings.ship_fee);

        this.pay = {
          products: this.rounder(products_price),
          tax: this.settings.tax,
          ship_fee: this.settings.ship_fee,
          total: this.rounder(tota)
        }
        console.log("pay ", this.pay);
      });
    })
  }

  rounder(val) {
    //return Math.round(val);
    return val.toFixed(2);
  }

  minus(quantity, i){
    if(quantity*1 - 1 < 1){
      this.list[i].quantity = 1;
      this.list[i].total = this.list[i].quantity * this.list[i].size_price;
    }else{
      this.list[i].quantity = quantity * 1 - 1;
      this.list[i].total = this.list[i].quantity * this.list[i].size_price;
    }
    this.storage.set('carts', this.list);
    this.calc_price();
  }

  plus(quantity, i){
    if(quantity*1 + 1 > 99){
      this.list[i].quantity = 99;
      this.list[i].total = this.list[i].quantity * this.list[i].size_price;
    }else{
      this.list[i].quantity = quantity * 1 + 1;
      this.list[i].total = this.list[i].quantity * this.list[i].size_price;
    }
    this.storage.set('carts', this.list);
    this.calc_price();
    console.log("list ", this.list);
  }

  enter_quantity(item){
    if(item.quantity > 99){
      item.quantity = 99;
    }if(item.quantity < 1){
      item.quantity = 1;
    }
    this.storage.set('carts', this.list);
    this.calc_price();
  }

  calc_price(){
    let products_price = 0;
    for(var i in this.list){
      products_price = products_price+ this.list[i].total_price*this.list[i].quantity;
    };

    let tota = 0;
    tota = parseFloat(this.settings.tax) / 100 ;
    tota = tota * (products_price + parseFloat(this.settings.ship_fee));
    tota = tota + products_price + parseFloat(this.settings.ship_fee);

    console.log("recalculate ", products_price, tota);

    this.pay = {
      products: this.rounder(products_price),
      tax: this.settings.tax,
      ship_fee: this.settings.ship_fee,
      total: this.rounder(tota)
    }
  }

  remove(index){
    this.storage.ready().then(() => {
      this.storage.get('carts').then((obj)=>{
        this.list.splice(index, 1);
        this.storage.set('carts', this.list);
        this.calc_price();
      });
    });

    let toast = this.toastCtrl.create({
      message:'Has Removed An Item',
      duration:1000,
      position:'top'
    })
    toast.present();

    return;
  }

  removeAll(){
    this.storage.ready().then(() => {
      this.storage.get('carts').then((obj)=>{
        this.list.splice(0, 10000);
        this.storage.set('carts', this.list);
      });
    });
  }

  checkout() {

    var d = new Date();

    if (d.getHours() >= this.store.OpenAt && d.getHours() <= this.store.CloseAt) {
      console.log("opennnnnnnnnnnnnn");
      this.navCtrl.push(CheckoutPage, { 'total': this.pay.total });
    } else {
      console.log("closssssssssss");
      this.storeClosed();
    }
  }

  storeClosed() {
    let alert = this.alertCtrl.create({
      title: 'Store Closed',
      subTitle: 'Sorry! the selected store is either closed or not accepting any orders right now. Please Try placing your order later.',
      buttons: [{
        text: 'Ok',
        handler: () => {
          this.navCtrl.setRoot(HomePage);
        }
      }],

    });
    alert.present();
    //this.presentAlert();
  }

  openSearchPage(){
    this.navCtrl.push(SearchPage);
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
