import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { environment } from '../../../environment';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.scss']
})
export class AdminPanel {
  form: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  uploadedUrls: string[] = [];

  private db;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      naziv: ['', Validators.required],
      cena: [0, Validators.required],
      kategorija: ['', Validators.required],
      opis: ['', Validators.required],
      link: ['']
    });

    const app = initializeApp(environment.firebase);
    this.db = getDatabase(app);
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.imagePreviews = this.selectedFiles.map(file =>
      URL.createObjectURL(file)
    );
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file); // 👈 Base64 DataURL
    });
  }

  async submit() {
    if (this.form.invalid || this.selectedFiles.length === 0) {
      this.toastr.error('Popuni sva polja i dodaj bar jednu sliku.');
      return;
    }

    try {
      this.uploadedUrls = [];

      // ✅ Pretvori svaku sliku u Base64 string
      for (let file of this.selectedFiles) {
        const base64 = await this.fileToBase64(file);
        this.uploadedUrls.push(base64);
      }

      // ✅ Proveri postojeće proizvode da odrediš sledeći ID
      const proizvodiRef = ref(this.db, 'proizvodi');
      const snapshot = await get(proizvodiRef);

      let newId = 1;
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ids = Object.keys(data).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
        if (ids.length > 0) {
          newId = Math.max(...ids) + 1;
        }
      }

      // ✅ Snimi proizvod pod numeričkim ID-jem
      const newProduct = {
        id: newId,
        ...this.form.value,
        slike: this.uploadedUrls,
        createdAt: Date.now()
      };

      await set(ref(this.db, `proizvodi/${newId}`), newProduct);

      this.toastr.success('Proizvod uspešno dodat!');
      this.form.reset();
      this.selectedFiles = [];
      this.imagePreviews = [];
      this.uploadedUrls = [];

    } catch (err) {
      console.error(err);
      this.toastr.error('❌ Greška pri snimanju proizvoda.');
    }
  }
}
