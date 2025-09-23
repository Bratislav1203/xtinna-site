import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {ProductService, Proizvod} from '../../services/product';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']   // ⚠️ ispravljeno na styleUrls
})
export class Navbar implements OnInit {
  logoPath = 'logo.png';
  menuOpen = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // test konekcije prema Firebase-u
    this.productService.getAllOnce();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
