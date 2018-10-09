import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { FoodListPage } from '../food/food_list';
import { CartListPage } from '../cart/cart_list';
import { SearchPage } from '../search/search';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage {
  list: any;
  base_url: any;
  total_card: any;
  location: any;
  settings:any='';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
    public http: Http, 
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public menuCtrl: MenuController,
    public storage: Storage) {

    this.storage.ready().then(() => {
      this.storage.get('location').then((obj) => {
        if (obj != null) {
          this.location = obj;
          console.log(obj, this.location);

          this.base_url = Constant.domainConfig.base_url;
          this.http.get(Constant.domainConfig.base_url + 'api/categories_api/categories?location=' + this.location).subscribe(data => {
            this.list = data.json();
            console.log(data.json());
          })

        } else {
          console.log('no location');
        }
      });



    })

    //this.base_url = Constant.domainConfig.base_url;
    //this.http.get(Constant.domainConfig.base_url + 'api/categories_api/categories?location=' + this.location ).subscribe(data=>{
    //  this.list = data.json();
    //  console.log(data.json());
    //})


    this.storage.ready().then(()=>{
      this.storage.get('settings').then(data=>{
        this.settings=data;
      })
    })
  }

  reounder(val) {
    //return Math.round(val);
    return val.toFixed(2);
  }

  ionViewWillEnter(){
    this.storage.get('carts').then((obj)=>{
      this.total_card = obj.length;
    });
  }

  openPage(item) {
    this.navCtrl.push(FoodListPage, { id: item.id, name: item.name, img: item.path});
  }

  openCartPage(){
    this.navCtrl.push(CartListPage);
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
