import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { FoodDetailPage } from '../food/food_detail';
import { AddCartPage } from '../modal/add_cart';
import { SearchPage } from '../search/search';
import { CartListPage } from '../cart/cart_list';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Events } from 'ionic-angular';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-transactions',
  templateUrl: 'transactions.html'
})
export class TransactionsPage {

  base_url: any;
  total_card: number;
  list: Array<any>;
  first: number;
  user_id: any='';
  settings: any = '';

  constructor(public navCtrl: NavController, 
    public socialSharing: SocialSharing,
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public navParams: NavParams,
    public http: Http,
    public events: Events,
    public menuCtrl: MenuController,
    public storage: Storage, 
    public modalCtrl: ModalController) {
         this.storage.get('settings').then(data=>{
        this.settings=data;
      })

    this.base_url = Constant.domainConfig.base_url;

    this.list = new Array();

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
        this.first=-5;
        this.list = new Array();
        this.loadMore();
      }
    });
  }

  loadMore(infiniteScroll:any=null){
    this.first+=5;
    this.http.get(this.base_url+'api/orders_api/transactions?first='+this.first+'&user_id='+this.user_id+'&offset='+5).subscribe(data=>{

      var jsonData = data.json();
      for (var i = 0; i < jsonData.length; i++) {


        this.list.push(jsonData[i]);
      }
      if(infiniteScroll){
        infiniteScroll.complete();
      }

    },error=>{
      if(infiniteScroll!=null){
        infiniteScroll.enable(false);
      }
    })
  }

  openCartPage(){
    this.navCtrl.push(CartListPage);
  }
  
  openSearchPage(){
    this.navCtrl.push(SearchPage);
  }

  menubtn() {
    this.menuCtrl.open();
    
  }
}
