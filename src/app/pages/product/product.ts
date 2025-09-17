import { Component, OnInit } from '@angular/core';
import { LowerCasePipe, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, RouterLink } from '@angular/router';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environment';
import { ProductService, Proizvod } from '../../services/product';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, UpperCasePipe, RouterLink],
  templateUrl: './product.html',
  styleUrls: ['./product.scss']
})
export class Product implements OnInit {
  images: string[] = [];
  mainImage: string = '';
  sizes = ['XS', 'S', 'M', 'L'];
  selectedSize: string | null = null;

  productId: number | null = null;
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

  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    // 👇 ID iz URL-a
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : null;

    if (!this.productId) {
      console.error('❌ Nema ID proizvoda u URL-u');
      this.toastr.error('Proizvod nije pronađen.');
      return;
    }

    try {
      const product: Proizvod | null = await this.productService.getByIdOnce(this.productId);
      if (product) {
        this.productTitle = product.naziv;
        this.productPrice = product.cena + ' RSD';
        this.productDesc = product.opis;
        this.productCategory = product.kategorija;
        this.images = product.slike || [];
        this.mainImage = this.images.length > 0 ? this.images[0] : '';
      } else {
        this.toastr.error('Proizvod nije pronađen.');
      }
    } catch (err) {
      console.error('❌ Greška pri čitanju proizvoda:', err);
      this.toastr.error('Greška pri učitavanju proizvoda.');
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
