import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Collections } from './pages/collections/collections';
import { Contact } from './pages/contact/contact';
import { Product } from './pages/product/product';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminPanel } from './components/admin-panel/admin-panel';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },

  // kolekcije (dinamički)
  { path: 'collections', component: Collections },
  { path: 'collections/:kolekcija', component: Collections },
  { path: 'collections/:kolekcija/:id', component: Product },

  { path: 'contact', component: Contact },

  // admin
  { path: 'admin/jasdlajkl123jklqajdkl', component: AdminLogin },
  { path: 'admin/panel', component: AdminPanel },

  // fallback → Home
  { path: '**', component: Home }
];
