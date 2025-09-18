import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environment';
import { CartService, CartItem } from '../../services/cart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class Cart implements OnInit {
  items: CartItem[] = [];
  total = 0;

  orderData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  };

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  private loadCart() {
    this.items = this.cartService.getItems();
    this.total = this.cartService.getTotal();
  }

  updateQty(index: number, qty: number) {
    this.cartService.updateQty(index, qty);
    this.loadCart();
  }

  remove(index: number) {
    this.cartService.remove(index);
    this.loadCart();
    this.toastr.info('Proizvod uklonjen iz korpe.');
  }

  submitOrder() {
    const itemsText = this.items
      .map(
        i =>
          `📦 ${i.proizvod.naziv} | 📏 ${i.size || '-'} | 🔢 ${
            i.qty
          } kom | 💰 ${i.proizvod.cena * i.qty} RSD`
      )
      .join('\n');

    const payload = {
      ...this.orderData,
      items: itemsText,
      total: this.total
    };

    emailjs
      .send(
        environment.emailjs.serviceID,
        environment.emailjs.templateID,
        payload,
        environment.emailjs.publicKey
      )
      .then(() => {
        this.toastr.success('Porudžbina uspešno poslata!');
        this.cartService.clearCart();
        this.loadCart();
        this.orderData = {
          name: '',
          email: '',
          phone: '',
          address: '',
          message: ''
        };
      })
      .catch(err => {
        this.toastr.error('Greška pri slanju porudžbine.');
        console.error('EmailJS error:', err);
      });
  }
}
