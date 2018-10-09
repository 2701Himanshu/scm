import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { CartListPage } from '../cart/cart_list';
import { SearchPage } from '../search/search';
import { AddCartPage } from '../modal/add_cart';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-food',
  templateUrl: 'food_detail.html'
})
export class FoodDetailPage {
  base_url: any;
  obj: any = '';
  total_card: any;
  favoriest_list: Array<any>;
  settings:any='';

  constructor(public navCtrl: NavController,
    public socialSharing: SocialSharing,
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public navParams: NavParams,
    public http: Http,
    public storage: Storage,
    public menuCtrl: MenuController,
    public toastCtrl:ToastController, 
    public modalCtrl: ModalController) {
    this.base_url = Constant.domainConfig.base_url;
    this.favoriest_list= new Array();
  }

  ionViewWillEnter(){
    this.storage.ready().then(() => {
      this.storage.get('settings').then(data=>{
        this.settings=data;
      })
      this.storage.get('favoriest_list').then((data)=>{
        this.favoriest_list = data;
        this.http.get(Constant.domainConfig.base_url+'api/foods_api/foods?product_id='+this.navParams.get('id')).subscribe(data=>{
          let obj = data.json();
          if(this.favoriest_list.indexOf(obj[0].id) != -1){
            obj[0].favoriest = true;
          }else{
            obj[0].favoriest = false;
          }
          this.obj = obj[0];
        })
      });
      this.storage.get('carts').then((obj)=>{
        this.total_card = obj.length;
      });
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
    let modal = this.modalCtrl.create(AddCartPage, { 'food_id': item.id, 'discount': item.discount_percent, 'price': item.price });
    modal.present();
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

  menubtn() {
    this.menuCtrl.open();
    
  }
}
