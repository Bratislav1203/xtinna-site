import { Component, OnInit } from '@angular/core';
import {LowerCasePipe, NgFor, NgIf, UpperCasePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environment';
import { RouterLink } from '@angular/router';   // 👈 dodaj ovo
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, LowerCasePipe, UpperCasePipe, RouterLink],
  templateUrl: './product.html',
  styleUrls: ['./product.scss']
})
export class Product implements OnInit {
  images: string[] = [];
  mainImage: string = '';
  sizes = ['XS', 'S', 'M', 'L'];
  selectedSize: string | null = null;

  productTitle = '';
  productPrice = '';
  productDesc = '';
  productCategory = '';

  popupOpen = false;

  orderData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  };

  constructor(private toastr: ToastrService) {}

  async ngOnInit() {
    // Inicijalizuj Firebase
    const app = initializeApp(environment.firebase);
    const db = getDatabase(app);

    try {
      // 👇 trenutno samo prvi proizvod iz baze (kasnije možeš po ID-u iz URL-a)
      const snapshot = await get(child(ref(db), 'proizvodi'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const keys = Object.keys(data);
        const product = data[keys[0]];

        this.productTitle = product.naziv;
        this.productPrice = product.cena + ' RSD';
        this.productDesc = product.opis;
        this.productCategory = product.kategorija;
        this.images = product.slike || [];
        this.mainImage = this.images.length > 0 ? this.images[0] : '';
      }
    } catch (err) {
      console.error('❌ Greška pri čitanju proizvoda:', err);
    }
  }

  setMainImage(img: string) {
    this.mainImage = img;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  openOrderPopup() {
    this.orderData = { name: '', email: '', phone: '', address: '', message: '' };
    this.popupOpen = true;
  }

  closeOrderPopup() {
    this.popupOpen = false;
  }

  submitOrder() {
    const payload = {
      ...this.orderData,
      product: this.productTitle,
      size: this.selectedSize,
      price: this.productPrice
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
        this.closeOrderPopup();
        this.orderData = { name: '', email: '', phone: '', address: '', message: '' };
        this.selectedSize = null;
      })
      .catch((err) => {
        this.toastr.error('Greška pri slanju porudžbine.', '❌ Greška');
        console.error('EmailJS error:', err);
      });
  }
}
