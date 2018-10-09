import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { FoodDetailPage } from '../food/food_detail';
import { AddCartPage } from '../modal/add_cart';
import { CartListPage } from '../cart/cart_list';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  base_url: any;
  total_card: number;
  msg_err: any;
  list: Array<any>;
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
    public modalCtrl: ModalController) {

    this.base_url = Constant.domainConfig.base_url;

    this.list = new Array();

    this.storage.ready().then(() => {
      this.storage.get('settings').then(obj=>{
        this.settings=obj;
      })
      
      this.storage.get('carts').then((obj)=>{
        this.total_card = obj.length;
      });

      this.storage.get('favoriest_list').then((data)=>{
        this.favoriest_list = data;
      });
    })
  }

  search(request){
    this.list= new Array();
    if(request == '' || request == null){
      this.list = null;
    }else{
      this.http.get(this.base_url+'api/foods_api/foods?title='+request).subscribe(data=>{
        if(data.json().empty == null){
          var jsonData = data.json();
          for (var i = 0; i < jsonData.length; i++) {
            if(this.favoriest_list.indexOf(jsonData[i].id) != -1){
              jsonData[i].favoriest = true;
            }else{
              jsonData[i].favoriest = false;
            }
            this.list.push(jsonData[i]);
          }
        }else{
          this.list = null;
          this.msg_err = 'Product not found matching the keyword';
        }
      });
    }
  }


  modalAddCart(item){
    console.log(item);
    let modal = this.modalCtrl.create(AddCartPage, { 'food_id': item.id, 'discount': item.discount_percent, 'price': item.price });
    modal.present();
  }

  openCartPage(){
    this.navCtrl.push(CartListPage);
  }

  openPage(id) {
    this.navCtrl.push(FoodDetailPage, {id:id});
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
