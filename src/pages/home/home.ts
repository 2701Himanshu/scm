import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, ModalController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { FoodDetailPage } from '../food/food_detail';
import { AddCartPage } from '../modal/add_cart';
import { CartListPage } from '../cart/cart_list';
import { CategoriesPage } from '../categories/categories';
import { SearchPage } from '../search/search';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AboutPage} from '../about/about';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Platform } from 'ionic-angular';

import { Events } from 'ionic-angular';

import { MenuController } from 'ionic-angular';
import { XHRBackend } from '@angular/http/src/backends/xhr_backend';

//import { trigger, state, style, transition, animate } from '@angular/animations';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  base_url: any;
  total_card: number;

  carts: Array<any>;
  favoriest_list: Array<any>;

  list: Array<any>;
  carousalList: Array<any>;
  first: number;
  settings: any = '';
  location: any;
  visible: boolean = true;
  visibleState: any = 'visible';
  vtate: boolean = true;
  notvisible: boolean = false;
  mst: number = 2;
  yourColor: any = "";
  stores: any = '';
  store: any = '';
  //x: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public callNumber:CallNumber,
    public iab: InAppBrowser,
    public http: Http,
    public storage: Storage,
    private alertCtrl: AlertController,
    public toastCtrl:ToastController,
    public socialSharing: SocialSharing,
    public platform: Platform,
    public events: Events,
    public menuCtrl: MenuController,
    public modalCtrl: ModalController) {
    this.base_url = Constant.domainConfig.base_url;
    this.carts = Array();
    this.favoriest_list = Array();
    //this.visible = true;

    //this.x = document.getElementById('nav-icon1');


    //jQuery('#nav-icon1').click(function() {
    //  console.log("okish");
    //  jQuery(this).toggleClass('open');
    //});

    events.subscribe('menu:opened', () => {

      //this.visible = true;
      this.vtate = true;
      this.yourColor = "red";
      //this.menubtn();
      console.log("got open request", this.vtate);
    });

    events.subscribe('menu:closed', () => {

      //his.visible = false;
      this.vtate = false;
      this.yourColor ="green";
      //this.menubtn();
      console.log("got close request", this.vtate);
    });

    this.storage.ready().then(() => {
      this.http.get(this.base_url+'api/settings_api/settings').subscribe(data=>{
        this.storage.set('settings',data.json());
        this.settings=data.json();
        console.log(this.settings);
      })

      this.http.get(this.base_url + 'api/stores_api/stores').subscribe(data => {
        this.storage.set('stores', data.json());
        this.stores = data.json();
        console.log("got stores",this.stores);
      })

      this.storage.get('carts').then((obj)=>{
        if(obj == null){
          this.storage.set('carts', this.carts);
        }
      });

      this.storage.get('location').then((obj) => {
        if (obj != null) {
          this.location = obj;
          console.log(obj, this.location);
        } else {
          console.log('no location');
          //this.presentAlert();
        }
      });

      this.events.subscribe('location_changed', (data) => {
        // user and time are the same arguments passed in `events.publish(user, time)`
        console.log('Welcome', data, 'at');

        //this.storage.set("location", data);
        this.location = data;

        this.first = -15;
        this.list = new Array();
        //this.loadMore();
      });

      this.storage.get('favoriest_list').then((data)=>{
        if(data == null){
          this.storage.set('favoriest_list', this.favoriest_list);
          this.favoriest_list=new Array();
        }else{
          this.favoriest_list = data;
        }

        this.carousalList = new Array();
        this.getCarousal();

        this.first=-15;
        this.list = new Array();
        this.loadMore();

      });
    });
  }

  //$('#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').click(function() {
  //  $(this).toggleClass('open');
  //});


  ionViewWillEnter(){
    console.log('ionViewWillEnter HomePage');
    this.storage.get('carts').then((obj)=>{
      this.total_card = obj.length;
    });
  }

  setStores(store) {
    console.log("set store to ", store);
    this.storage.ready().then(() => {
      this.storage.get('stores').then((obj) => {
        for (var i = 0; i < obj.length; i++) {
          if (obj[i].value == store) {
            console.log("store is ", obj[i]);

            var d = new Date();
            if (d.getHours() >= obj[i].OpenAt && d.getHours() <= obj[i].CloseAt) {
              console.log("opennnnnnnnnnnnnn");
              this.storage.set('store', obj[i]);
              this.openCatPage();
            } else {
              console.log("closssssssssss");
              this.storage.set('store', obj[i]);
              this.openCatPage();
              this.storeClosed();
            }

            //if (obj[i].Open != "Yes") {
            //  this.storeClosed();
            //} else {
            //  this.storage.set('store', obj[i]);
            //  this.openCatPage();
            //}
          }
        }
      });
    })
  }

  getCarousal() {
    console.log("i am trying to get the carousal");

    this.http.get(this.base_url + 'api/carousal_api/carousal').subscribe(data => {

      var jsonData = data.json();
      for (var i = 0; i < jsonData.length; i++) {
        this.carousalList.push(jsonData[i]);
        //if (this.favoriest_list.indexOf(jsonData[i].id) != -1) {
        //  jsonData[i].favoriest = true;
        //} else {
        //  jsonData[i].favoriest = false;
        //}
        //if (jsonData[i].location == this.location) {
        //  this.carousalList.push(jsonData[i]);
        //}
      }

      console.log('carousal list is ', this.carousalList);

    }, error => {
      console.log('got error ', error);
    })

  }

  loadMore(infiniteScroll: any = null) {
    console.log('ran the bond', this);

    this.first+=15;
    this.http.get(this.base_url+'api/foods_api/foods?first='+this.first+'&offset='+15).subscribe(data=>{

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
      if(infiniteScroll){
        infiniteScroll.complete();
      }

    },error=>{
      if(infiniteScroll!=null){
        infiniteScroll.enable(false);
      }
    })
  }

  processLocation() {
    this.storage.ready().then(() => {
      this.storage.get('location').then((obj) => {
        this.location = obj;
        console.log(obj, this.location);
      });
    })
  }

  presentAlert() {

    let alert = this.alertCtrl.create({ cssClass: 'alertCustomCss' });
    alert.setTitle('Select Store Location');



    for (var i = 0; i < this.stores.length; i++) {
      if (i == 0)
        alert.addInput({ type: 'radio', label: this.stores[i].name, value: this.stores[i].value, checked: true });
      else
        alert.addInput({ type: 'radio', label: this.stores[i].name, value: this.stores[i].value });
    }
    //alert.addInput({ type: 'radio', label: 'Bondi Junction', value: 'Bondi Junction', checked: true });
    //alert.addInput({ type: 'radio', label: 'Circular Quay', value: 'CIRCULAR QUAY' });
    //alert.addInput({ type: 'radio', label: 'Gasworks', value: 'GASWORKS' });

    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Site:', data);
        this.storage.set("location", data);
        this.location = data;

        //this.cheackStore("asd");


        this.first = -15;
        this.list = new Array();

        this.setStores(data);
        this.storage.set("delivery", 0);
        //this.loadMore();
      }
    });
    alert.present();
    //processLocation();
  }

  cheackStore(sto) {
    console.log("store is sto", sto);

  }

  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Select Location',
      inputs: [
        {
          name: 'pincode',
          placeholder: 'Postcode'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          handler: data => {
            console.log("got pincode ", data);
            this.setPinCode(data);
            //this.openCatPage();
          }
        }
      ]
    });
    alert.present();
  }

  setPinCode(pin) {
    this.http.get(this.base_url + 'api/pincode_api/pincode?pin=' + pin.pincode).subscribe(data => {
      var jd = data.json();
      console.log(" got location ", jd);

      if (jd.length && jd[0].store) {
        console.log(" got location ", jd[0].store);

        this.stores.forEach((a) => {
          if (a.name == jd[0].store && a.Open == "Yes") {
            this.storage.set("location", jd[0].store);
            this.storage.set("delivery", jd[0].delivery);
            this.location = jd[0].store;
            this.setStores(jd[0].store);
          } else {
            this.pinNotFound();
          }
        })

        //this.openCatPage();
      } else {
        this.pinNotFound();
      }
    }, error => {
      console.log("got error");
    })
  }

  storeClosed() {
    let alert = this.alertCtrl.create({
      title: 'Store Closed',
      subTitle: 'Sorry! The Selected Store is either Closed or Not available for taking any orders at this time.',
      buttons: [{
        text: 'Ok',
        handler: () => {
          //this.presentAlert();
        }
      }],

    });
    alert.present();
    //this.presentAlert();
  }

  pinNotFound() {
    let alert = this.alertCtrl.create({
      title: 'Postcode Not Found',
      subTitle: 'Sorry! the postcode mentioned by you is either not available or store is offline right now, Please select a store for Take Away',
      buttons: [{
        text: 'Ok',
        handler: () => {
          this.presentAlert();
        }
      }],

    });
    alert.present();
    //this.presentAlert();
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

  send_message(){
    this.navCtrl.push(AboutPage);

  }

  toggleVisible() {
    this.visibleState = (this.visibleState == 'visible') ? 'invisible' : 'visible';
  }

  menubtn() {
    this.menuCtrl.open();
    console.log("menubtn ", this.vtate);
  }

  modalAddCart(item){
    console.log(item);
    let modal = this.modalCtrl.create(AddCartPage, { 'food_id': item.id, 'discount': item.discount_percent, 'price': item.price });
    modal.present();
  }

  openPage(id) {
    this.navCtrl.push(FoodDetailPage, {id:id});
  }

  openCartPage(){
    this.navCtrl.push(CartListPage);
  }

  openCatPage(){
    this.navCtrl.push(CategoriesPage);
  }

  openSearchPage(){

    this.navCtrl.push(SearchPage);
  }

  openAboutPage() {

    this.navCtrl.push(AboutPage);
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


}
