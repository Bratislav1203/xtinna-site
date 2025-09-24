import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductService, Proizvod } from '../../services/product';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './product.html',
  styleUrls: ['./product.scss']
})
export class Product implements OnInit {
  images: string[] = [];
  mainImage = '';
  sizes = ['XS', 'S', 'M', 'L'];
  selectedSize: string | null = null;

  productId: number | null = null;
  productTitle = '';
  productPrice = '';
  productDesc = '';
  productCategory = '';
  proizvod: Proizvod | null = null;

  hasItemsInCart = false;

  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : null;

    if (!this.productId) {
      this.toastr.error('Proizvod nije pronađen.');
      return;
    }

    try {
      const product: Proizvod | null = await this.productService.getByIdOnce(this.productId);
      if (product) {
        this.proizvod = product;
        this.productTitle = product.naziv;
        this.productPrice = product.cena + ' RSD';
        this.productDesc = product.opis;
        this.productCategory = product.kategorija;
        this.images = product.slike || [];
        this.mainImage = this.images.length > 0 ? this.images[0] : '';
      } else {
        this.toastr.error('Proizvod nije pronađen.');
      }

      // proveri da li već ima nešto u korpi
      this.hasItemsInCart = this.cartService.getItems().length > 0;
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

  addToCart() {
    if (!this.proizvod) return;
    this.cartService.addToCart({
      proizvod: this.proizvod,
      size: this.selectedSize,
      qty: 1
    });
    this.toastr.success('Proizvod dodat u korpu!');
    this.hasItemsInCart = true; // posle dodavanja sigurno ima
  }

  nextImage() {
    if (!this.images || this.images.length === 0) return;
    const idx = this.images.indexOf(this.mainImage);
    if (idx < this.images.length - 1) {
      this.mainImage = this.images[idx + 1];
    }
  }

  prevImage() {
    if (!this.images || this.images.length === 0) return;
    const idx = this.images.indexOf(this.mainImage);
    if (idx > 0) {
      this.mainImage = this.images[idx - 1];
    }
  }

  onMainImageClick(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    const clickX = event.offsetX;
    const width = element.clientWidth;

    if (clickX > (width * 2) / 3) {
      this.nextImage();
    } else if (clickX < width / 3) {
      this.prevImage();
    }
  }
}
