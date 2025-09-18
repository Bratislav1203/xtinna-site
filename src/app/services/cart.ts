import { Injectable } from '@angular/core';
import { Proizvod } from './product';

export interface CartItem {
  proizvod: Proizvod;
  size: string | null;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'cart-items';
  private items: CartItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    this.items = data ? JSON.parse(data) : [];
  }

  getItems(): CartItem[] {
    return this.items;
  }

  addToCart(item: CartItem) {
    // proveri da li već postoji isti proizvod + veličina
    const existing = this.items.find(
      i => i.proizvod.naziv === item.proizvod.naziv && i.size === item.size
    );

    if (existing) {
      existing.qty += item.qty; // samo uvećaj količinu
    } else {
      this.items.push(item);
    }

    this.saveToStorage();
  }

  updateQty(index: number, qty: number) {
    if (this.items[index]) {
      this.items[index].qty = qty;
      this.saveToStorage();
    }
  }

  remove(index: number) {
    this.items.splice(index, 1);
    this.saveToStorage();
  }

  clearCart() {
    this.items = [];
    this.saveToStorage();
  }

  getTotal(): number {
    return this.items.reduce(
      (sum, i) => sum + i.proizvod.cena * i.qty,
      0
    );
  }
}
