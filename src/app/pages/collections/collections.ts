import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService, Proizvod, Kategorija } from '../../services/product';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, TitleCasePipe],
  templateUrl: './collections.html',
  styleUrls: ['./collections.scss']
})
export class Collections implements OnInit {
  proizvodi: Proizvod[] = [];
  filtrirani: Proizvod[] = [];
  aktivniFilter: 'sve' | Kategorija = 'sve';
  loading = true; // ⏳ indikator da se podaci učitavaju

  labels: Record<Kategorija, string> = {
    zenska: 'Ženska kolekcija',
    muska: 'Muška kolekcija',
    deca: 'Dečija kolekcija'
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // slušamo query parametre i menjamo filter
    this.route.queryParams.subscribe(params => {
      const filter = params['filter'] as Kategorija | undefined;
      this.aktivniFilter = filter ?? 'sve';
      console.log('📌 Aktivni filter:', this.aktivniFilter);
      this.primeniFilter();
    });

    // punimo proizvode iz baze
    this.productService.getAllOnce().then((proizvodi) => {
      console.log('✅ Dobijeni proizvodi iz baze:', proizvodi);
      this.proizvodi = this.pripremiProizvode(proizvodi);
      console.log('🛠 Posle pripreme (filtrirane slike):', this.proizvodi);
      this.primeniFilter();
      this.loading = false; // podaci spremni
    }).catch(err => {
      console.error('❌ Greška pri dohvatanju proizvoda:', err);
      this.loading = false; // ugasi loader i u slučaju greške
    });
  }

  postaviFilter(filter: 'sve' | Kategorija): void {
    console.log('🔄 Menjam filter na:', filter);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: filter === 'sve' ? null : filter },
      queryParamsHandling: 'merge'
    });
  }

  private primeniFilter(): void {
    if (this.aktivniFilter === 'sve') {
      this.filtrirani = this.proizvodi;
    } else {
      this.filtrirani = this.proizvodi.filter(p => p.kategorija === this.aktivniFilter);
    }
    console.log('🎯 Filtrirani proizvodi:', this.filtrirani);
  }

  private pripremiProizvode(proizvodi: Proizvod[]): Proizvod[] {
    return proizvodi.map(p => {
      const slike = (p.slike || []).filter(s => !!s);
      console.log(`🖼 Proizvod "${p.naziv}" -> slike:`, slike);
      return { ...p, slike };
    });
  }

  getPrvaSlika(p: Proizvod): string | null {
    if (p.slike && p.slike.length > 0) {
      console.log(`📷 Prva slika za "${p.naziv}":`, p.slike[0]);
      return p.slike[0];
    }
    console.warn(`⚠️ Proizvod "${p.naziv}" nema sliku!`);
    return null;
  }

  formatCena(cena: number): string {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD'
    }).format(cena);
  }
}
