import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { environment } from '../../../environment';
import { GoogleDriveService } from '../../services/google-drive';

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
  private readonly DRIVE_FOLDER_ID = '1xjoeiDJ_qjqli2ldh07QsGDdCcsyz1zo'; // 👈 tvoj folder ID

  private db;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private googleDrive: GoogleDriveService
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

  async submit() {
    if (this.form.invalid || this.selectedFiles.length === 0) {
      this.toastr.error('Popuni sva polja i dodaj bar jednu sliku.');
      return;
    }

    try {
      this.uploadedUrls = [];

      // ✅ Login na Google i čekaj token
      await this.googleDrive.signIn();

      // ✅ Upload svake slike na Drive
      for (let file of this.selectedFiles) {
        const fileMeta = await this.googleDrive.uploadFile(file, this.DRIVE_FOLDER_ID);

        // koristi webContentLink za <img>
        this.uploadedUrls.push(fileMeta.webContentLink);

        // možeš sačuvati i thumbnailLink ako hoćeš za preview
        // this.uploadedUrls.push(fileMeta.thumbnailLink);
      }

      // ✅ Pripremi novi proizvod
      const newProduct = {
        ...this.form.value,
        slike: this.uploadedUrls,
        createdAt: Date.now()
      };

      // ✅ Snimi proizvod u Firebase Realtime Database
      const newRef = push(ref(this.db, 'proizvodi'));
      await set(newRef, newProduct);

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
