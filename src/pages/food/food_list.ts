import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { AlertController } from 'ionic-angular';

import { FoodDetailPage } from './food_detail';
import { CartListPage } from '../cart/cart_list';
import { SearchPage } from '../search/search';
import { AddCartPage } from '../modal/add_cart';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-food',
  templateUrl: 'food_list.html'
})
export class FoodListPage {
  base_url: any;
  total_card: any;
  favoriest_list: Array<any>;
  list: Array<any>;
  first: number;
  settings:any='';
  title:any='';
  location: any;
  img: any = '';
  constructor(public navCtrl: NavController,
    public socialSharing: SocialSharing,
    public navParams: NavParams,
    public http: Http,
    public storage: Storage, 
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    private alertCtrl: AlertController,
    public toastCtrl:ToastController,
    public modalCtrl: ModalController) {
    this.base_url = Constant.domainConfig.base_url;
    this.title = this.navParams.get('name');
    this.img = this.navParams.get('img');
  }

  ionViewWillEnter(){
    this.storage.ready().then(() => {
      this.storage.get('settings').then((data)=>{
        this.settings=data;
      })
      this.storage.get('favoriest_list').then((data)=>{
        this.favoriest_list = data;
        this.first=-5;
        this.list=new Array();
        this.loadMore();
      });
    })

    this.storage.get('location').then((obj) => {
      this.location = obj;
      console.log(obj, this.location);
      if (this.location == "") {
        console.log('no location');
        this.presentAlert();
      }
    });

    this.storage.get('carts').then((obj) => {
      this.total_card = obj.length;
    });

  }

  presentAlert() {

    let alert = this.alertCtrl.create({ cssClass: 'alertCustomCss' });
    alert.setTitle('Select Store Location');
    alert.addInput({ type: 'radio', label: 'Bondi Junction', value: 'Bondi Junction', checked: true });
    alert.addInput({ type: 'radio', label: 'Circular Quay', value: 'CIRCULAR QUAY' });
    alert.addInput({ type: 'radio', label: 'Gasworks', value: 'GASWORKS' });

    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Site:', data);
        this.storage.set("location", data);
        this.location = data;
      }
    });
    alert.present();
    //processLocation();
  }

  rounder(val) {
    //return Math.round(val);
    return val.toFixed(2);
  }

  loadMore(infiniteScroll: any = null) {
    console.log('ran the bond', this);

    this.first+=5;
    this.http.get(this.base_url+'api/foods_api/foods?categories_id='+this.navParams.get('id')+'&first='+this.first+'&offset='+5).subscribe(data=>{

      var jsonData = data.json();
      for (var i = 0; i < jsonData.length; i++) {
        if(this.favoriest_list.indexOf(jsonData[i].id) != -1){
          jsonData[i].favoriest = true;
        }else{
          jsonData[i].favoriest = false;
        }
        if (jsonData[i].location == this.location) {
          this.list.push(jsonData[i]);
        }
      }

      console.log(data.json());
      var jsonData=data.json();

      if(infiniteScroll){
        infiniteScroll.complete();
      }

    },error=>{
      if(infiniteScroll!=null){
        infiniteScroll.enable(false);
      }
    })
  }

  addFavoriest(item){
    if(item.favoriest){
      item.favoriest=false;
      let index_of = this.favoriest_list.indexOf(item.id);
      this.favoriest_list.splice(index_of,1);
    }else{
      item.favoriest=true;
      this.favoriest_list.push(item.id);
    }
    this.storage.set('favoriest_list', this.favoriest_list);
  }



  modalAddCart(item){
    console.log(item);
    let modal = this.modalCtrl.create(AddCartPage, { 'food_id': item.id, 'discount': item.discount_percent, 'price': item.price, cssClass: 'alertCustomCss' });
    //{ cssClass: 'alertCustomCss' }
    modal.onDidDismiss(data => {

      setTimeout(() => {    //<<<---    using ()=> syntax
        this.okies();
      }, 1000);
      
      
      console.log(data);
    });
    modal.present();
  }

  okies() {
    
    this.storage.get('carts').then((obj) => {
      this.total_card = obj.length;
      console.log("total_card", obj.length);

    });
    this.storage.get('carts').then((obj) => {
      this.total_card = obj.length;
      console.log("total_card", obj.length);

    });
  }

  openPage(id) {
    this.navCtrl.push(FoodDetailPage, {id:id});
  }

  openCartPage(){
    this.navCtrl.push(CartListPage);
  }

  openSearchPage(){
    this.navCtrl.push(SearchPage);
  }

   share(item){
    this.socialSharing.share(item.name, item.description, null , Constant.domainConfig.base_url+'food?id='+item.id); 
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


  //ionViewWillEnter() {
  //  this.storage.get('carts').then((obj) => {
  //    this.total_card = obj.length;
  //  });
  //}

}
