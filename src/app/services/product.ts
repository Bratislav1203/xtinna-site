import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Kategorija = 'zenska' | 'muska' | 'dečija';

export interface Proizvod {
  id: number;
  naziv: string;
  cena: number;
  slike: string[];
  kategorija: Kategorija;
  opis: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll$(): Observable<Proizvod[]> {
    return this.http.get<Proizvod[]>('/products.json');
  }

  async getAllOnce(): Promise<Proizvod[]> {
    const proizvodi = await this.http.get<Proizvod[]>('/products.json').toPromise();
    return proizvodi ?? [];
  }

  async getByIdOnce(id: number): Promise<Proizvod | null> {
    const proizvodi = await this.getAllOnce();
    return proizvodi.find(p => p.id === id) ?? null;
  }

  async getByCategoryOnce(cat: Kategorija): Promise<Proizvod[]> {
    const proizvodi = await this.getAllOnce();
    return proizvodi.filter(p => p.kategorija === cat);
  }
}
