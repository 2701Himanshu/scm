import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { FoodDetailPage } from '../food/food_detail';
import { CartListPage } from '../cart/cart_list';
import { SearchPage } from '../search/search';
import { AddCartPage } from '../modal/add_cart';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MenuController } from 'ionic-angular';

@Component({
  selector: 'page-offer',
  templateUrl: 'offer.html'
})
export class OfferPage {
  base_url: any;
  list: Array<any>;
  first: number;
  total_card: any;
  favoriest_list: Array<any>;
  settings: any = '';
  location: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public socialSharing: SocialSharing,
    public storage: Storage,
    private alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public callNumber: CallNumber,
    public iab: InAppBrowser,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController) {
    this.base_url = Constant.domainConfig.base_url;

  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter OfferPage');

    this.storage.get('carts').then((obj) => {
      this.total_card = obj.length;
    });

    this.storage.ready().then(() => {
      this.storage.get('settings').then(obj => {
        this.settings = obj;
      })
      this.favoriest_list = new Array();
      this.storage.get('favoriest_list').then((data) => {
        this.favoriest_list = data;
        this.first = -5;
        this.list = new Array();
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

  loadMore(infiniteScroll: any = null) {
    this.first += 5;
    this.http.get(this.base_url + 'api/foods_api/foods?is_offered=1' + '&first=' + this.first + '&offset=' + 5).subscribe(data => {

      var jsonData = data.json();
      for (var i = 0; i < jsonData.length; i++) {
        if (this.favoriest_list.indexOf(jsonData[i].id) != -1) {
          jsonData[i].favoriest = true;
        } else {
          jsonData[i].favoriest = false;
        }
        //this.list.push(jsonData[i]);
        if (jsonData[i].location == this.location) {
          this.list.push(jsonData[i]);
        }
      }

      console.log(data.json());
      var jsonData = data.json();

      if (infiniteScroll) {
        infiniteScroll.complete();
      }
    }, error => {
      if (infiniteScroll != null) {
        infiniteScroll.enable(false);
      }
    })
  }

  rounder(val) {
    //return Math.round(val);
    return val.toFixed(2);
  }

  modalAddCart(item) {
    console.log(item);
    let modal = this.modalCtrl.create(AddCartPage, { 'food_id': item.id, 'discount': item.discount_percent, 'price': item.price });
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


  addFavoriest(item) {
    if (item.favoriest) {
      item.favoriest = false;
      let index_of = this.favoriest_list.indexOf(item.id);
      this.favoriest_list.splice(index_of, 1);
    } else {
      item.favoriest = true;
      this.favoriest_list.push(item.id);
    }
    this.storage.set('favoriest_list', this.favoriest_list);
  }

  openPage(id) {
    this.navCtrl.push(FoodDetailPage, { id: id });
  }

  openCartPage() {
    this.navCtrl.push(CartListPage);
  }

  openSearchPage() {
    this.navCtrl.push(SearchPage);
  }

  share(item) {
    this.socialSharing.share(item.name, item.description, null, Constant.domainConfig.base_url + 'food?id=' + item.id);
  }


  facebook() {
    let browser = this.iab.create(this.settings.facebook);
  }

  twitter() {
    let browser = this.iab.create(this.settings.twitter);
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
