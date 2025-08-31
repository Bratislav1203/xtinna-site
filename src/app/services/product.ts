import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { getApps, getApp, initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase, ref, get, set, onValue,
  query, orderByChild, equalTo, Database
} from 'firebase/database';

import { environment } from '../../environment';

export type Kategorija = 'zenska' | 'muska' | 'deca';
export interface Proizvod {
  id: number;            // jedinstveni ID proizvoda
  naziv: string;         // naziv proizvoda
  cena: number;          // cena proizvoda
  slike: string[];       // niz URL-ova slika proizvoda
  kategorija: Kategorija;// referenca na kategoriju
  link: string;          // link ka detaljima ili eksternoj stranici
  opis: string;
}


const PROIZVODI_PATH = 'proizvodi';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private app: FirebaseApp;
  private db: Database;

  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.db  = getDatabase(this.app);
  }

  async getAllOnce(): Promise<Proizvod[]> {
    const snap = await get(ref(this.db, PROIZVODI_PATH));
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, Proizvod>);
  }

  getAll$(): Observable<Proizvod[]> {
    return new Observable<Proizvod[]>((sub) => {
      const off = onValue(ref(this.db, PROIZVODI_PATH), (snap) => {
        if (!snap.exists()) return sub.next([]);
        sub.next(Object.values(snap.val() as Record<string, Proizvod>));
      }, (err) => sub.error(err));
      return () => off();
    });
  }

  async getByIdOnce(id: number): Promise<Proizvod | null> {
    const snap = await get(ref(this.db, `${PROIZVODI_PATH}/${id}`));
    return snap.exists() ? (snap.val() as Proizvod) : null;
  }

  async getByCategoryOnce(cat: Kategorija): Promise<Proizvod[]> {
    const q = query(ref(this.db, PROIZVODI_PATH), orderByChild('kategorija'), equalTo(cat));
    const snap = await get(q);
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, Proizvod>);
  }

  async seedIfEmpty(seed: Proizvod[]): Promise<boolean> {
    const r = ref(this.db, PROIZVODI_PATH);
    const snap = await get(r);
    if (snap.exists()) return false;
    const rec = Object.fromEntries(seed.map(p => [p.id, p])) as Record<number, Proizvod>;
    await set(r, rec);
    return true;
  }
}
