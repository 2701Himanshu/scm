
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import  * as Constant from '../config/constants';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { TransactionsPage } from '../pages/transactions/transactions';
import { CategoriesPage } from '../pages/categories/categories';
import { AboutPage } from '../pages/about/about';
import { LoginPage } from '../pages/users/login';
import { SignupPage } from '../pages/users/signup';
import { ProfilePage } from '../pages/users/profile';
import { FoodListPage } from '../pages/food/food_list';
import { FoodDetailPage } from '../pages/food/food_detail';
import { CartListPage } from '../pages/cart/cart_list';
import { CheckoutPage } from '../pages/cart/checkout';
import { SearchPage } from '../pages/search/search';
import { AddCartPage } from '../pages/modal/add_cart';
import { FavoritesPage } from '../pages/favorites/favorites';
import { OfferPage } from '../pages/offer/offer';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Stripe } from '@ionic-native/stripe';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CallNumber } from '@ionic-native/call-number';
import { OneSignal } from '@ionic-native/onesignal';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

/*translate loader*/
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
/*end translate loader*/

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//import [
//  BrowserModule,
//  BrowserAnimationsModule,
//  IonicModule.forRoot(MyApp)
//],

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TransactionsPage,
    CategoriesPage,
    AboutPage,
    LoginPage,
    SignupPage,
    ProfilePage,
    FavoritesPage,
    OfferPage,
    FoodListPage,
    FoodDetailPage,
    CartListPage,
    CheckoutPage,
    SearchPage,
    AddCartPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TransactionsPage,
    CategoriesPage,
    AboutPage,
    LoginPage,
    SignupPage,
    ProfilePage,
    FoodListPage,
    FoodDetailPage,
    CartListPage,
    CheckoutPage,
    SearchPage,
    AddCartPage,
    FavoritesPage,
    OfferPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HttpModule,
    HttpClientModule,
    Stripe,
    Facebook,
    SocialSharing,
    InAppBrowser,
    CallNumber,
    OneSignal,
    PayPal,
    Facebook,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
