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
  loading = true;

  labels: Record<Kategorija, string> = {
    ženska: 'Ženska kolekcija',
    muška: 'Muška kolekcija',
    dečija: 'Dečija kolekcija'
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
      this.primeniFilter();
    });

    // punimo proizvode iz products.json
    this.productService.getAllOnce().then((proizvodi) => {
      this.proizvodi = this.pripremiProizvode(proizvodi);
      this.primeniFilter();
      this.loading = false;
    }).catch(err => {
      console.error('❌ Greška pri dohvatanju proizvoda:', err);
      this.loading = false;
    });
  }

  postaviFilter(filter: 'sve' | Kategorija): void {
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
  }

  private pripremiProizvode(proizvodi: Proizvod[]): Proizvod[] {
    return proizvodi.map(p => {
      const slike = (p.slike || []).filter(s => !!s);
      return { ...p, slike };
    });
  }

  getPrvaSlika(p: Proizvod): string | null {
    return p.slike && p.slike.length > 0 ? p.slike[0] : null;
  }

  formatCena(cena: number): string {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD'
    }).format(cena);
  }
}
