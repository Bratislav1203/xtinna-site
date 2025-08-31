import { Injectable } from '@angular/core';

declare const google: any;
declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private CLIENT_ID = '241001889104-5uln5e9umdn94qhlmsv0r1dg0kr9l2kb.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyA7nSTqSva1r6xpUIISara3XwwP4y5q-Ik';
  private SCOPES = 'https://www.googleapis.com/auth/drive.file';
  private tokenClient: any;
  private gapiInited = false;

  constructor() {
    this.loadGapiClient();
  }

  /** Učitavanje GAPI biblioteke */
  private loadGapiClient() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
          ]
        });
        this.gapiInited = true;
      });
    };
    document.body.appendChild(script);
  }

  /** Inicijalizacija GIS token klijenta */
  private initTokenClient() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: () => {} // pravi callback definišemo u signIn
    });
  }

  /** Login / dobijanje access token-a */
  async signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        this.initTokenClient();
      }

      this.tokenClient.callback = (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          console.log('✅ Token primljen:', tokenResponse);
          gapi.client.setToken(tokenResponse);
          resolve();
        } else {
          reject('❌ Nije dobijen token.');
        }
      };

      this.tokenClient.requestAccessToken();
    });
  }

  /** Upload fajla na Google Drive i vrati linkove */
  async uploadFile(file: File, folderId: string): Promise<{id: string, webContentLink: string, thumbnailLink: string}> {
    if (!this.gapiInited) {
      throw new Error('❌ GAPI još nije inicijalizovan.');
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId]
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const token = gapi.client.getToken();
    if (!token) {
      throw new Error('❌ Nema aktivnog Google tokena, pozovi signIn() prvo.');
    }

    // === 1. Upload fajla ===
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: new Headers({
          Authorization: 'Bearer ' + token.access_token
        }),
        body: form
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('❌ Greška pri upload-u: ' + errorText);
    }

    const data = await response.json();
    const fileId = data.id;

    // === 2. Postavi permission na "Anyone with link" ===
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      }
    );

    // === 3. Dohvati linkove (webContentLink, thumbnailLink) ===
    const metaResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,webContentLink,thumbnailLink`,
      {
        headers: {
          'Authorization': 'Bearer ' + token.access_token
        }
      }
    );

    if (!metaResp.ok) {
      const errTxt = await metaResp.text();
      throw new Error('❌ Greška pri dohvaćanju meta podataka: ' + errTxt);
    }

    const meta = await metaResp.json();
    console.log('📂 File meta:', meta);

    return {
      id: meta.id,
      webContentLink: meta.webContentLink,
      thumbnailLink: meta.thumbnailLink
    };
  }
}
