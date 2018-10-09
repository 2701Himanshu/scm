import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';

import { CartListPage } from '../cart/cart_list';
import { SearchPage } from '../search/search';

@Component({
  selector: 'page-modal',
  templateUrl: 'add_cart.html'
})
export class AddCartPage {
  base_url: any;
  list: any;
  list_only: any;
  list_ext: any;
  discount: any=0;
  food_id: any;
  price:any;
  snug_size_name: any;
  snug_size_price: any=0;
  snug_ext_id: any;
  snug_ext_name: any;
  snug_ext_price: any;
  total_price: any='';
  temp_ext_id: any;
  select_size:any='';
  settings:any='';

  constructor(public navCtrl: NavController,
   public navParams: NavParams,
   public http: Http,
   public storage: Storage,
   public toastCtrl:ToastController,
   public viewCtrl: ViewController,) {
    
    this.base_url = Constant.domainConfig.base_url;
    this.discount = this.navParams.get('discount');
    this.food_id = this.navParams.get('food_id');
    this.price= this.navParams.get("price");
    this.temp_ext_id = new Array();
    this.list = new Array();

    this.storage.get('settings').then(data=>{
      this.settings=data;
    })

    this.http.get(Constant.domainConfig.base_url+'api/food_sizes_api/size?food_id='+this.food_id).subscribe(data=>{
      if(data.json().empty == null){
        this.list = data.json();
        console.log(this.list);
      }else{
        this.list = null;
        this.total_price = this.price*1 - this.price*this.discount/100;
        this.snug_size_name = 'default';
        this.snug_size_price = this.total_price;
      }
    })

    this.list_ext = new Array();

    this.http.get(Constant.domainConfig.base_url+'api/food_extras_api/extra?food_id='+this.food_id).subscribe(data=>{
      if(data.json().empty == null){
        this.list_ext = data.json();
      }else{
        this.list_ext = null;
      }
      console.log(this.list_ext);
    })

  }

  selectSize(name, price){
    this.snug_size_name = name;
    this.total_price = this.total_price*1 - this.snug_size_price*1 + (price*1 - price*this.discount/100);
    this.snug_size_price = price - price*this.discount/100;
  }

  selectExt(price, id){
    let index_of = this.temp_ext_id.indexOf(id);
    if(index_of == -1){
      this.temp_ext_id.push(id);
      this.total_price = this.total_price*1 + price*1;
    }else{
      this.temp_ext_id.splice(index_of, 1);
      this.total_price = this.total_price*1 - price*1;
    }

    let arr = this.temp_ext_id.sort(function(a, b){return a - b});

    this.snug_ext_id = '';
    this.snug_ext_name = '';
    this.snug_ext_price = '';
    
    if(arr != ''){
      for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < this.list_ext.length; j++) {
          if(arr[i] == this.list_ext[j].id){
            this.snug_ext_id += arr[i] + ',';
            this.snug_ext_name += this.list_ext[j].name + ',';
            this.snug_ext_price += this.list_ext[j].price + ',';
          }
        }
      }
    }
  }

  addToCart(){
    if(this.list!=null && this.select_size==''){
      alert("Please select an size");
    }else{

    this.storage.ready().then(() => {
      this.storage.get('carts').then((data)=>{
        let carts = data;

        let check = false;

        for ( var i in carts ) {
          if(carts[i].id == this.food_id && carts[i].size_name == this.snug_size_name && carts[i].lst_extras_id == this.snug_ext_id){
            check = true;
            carts[i].quantity = carts[i].quantity*1 + 1;
            this.storage.set('carts', carts);
            break;
          }
        };
        
        if(check == false){
          this.http.get(Constant.domainConfig.base_url+'api/foods_api/foods?product_id='+this.food_id).subscribe(obj=>{
            let temp_obj = obj.json()[0];

            temp_obj.quantity = 1;
            temp_obj.lst_extras_name = this.snug_ext_name;
            temp_obj.lst_extras_id = this.snug_ext_id;
            temp_obj.lst_extras_price = this.snug_ext_price;
            temp_obj.size_name = this.snug_size_name;
            temp_obj.size_price = this.snug_size_price;
            temp_obj.total_price = this.total_price;

            carts.push(temp_obj);
            this.storage.set('carts', carts);
            
          });
        };

      });
    });

    this.viewCtrl.dismiss();

    let toast = this.toastCtrl.create({
      message:'Successfully Added',
      duration:1000,
      position:'top'
    })
    toast.present();

     }

    return;
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
