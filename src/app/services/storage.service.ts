import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Salvar dados
  public async set(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  // Buscar dados
  public async get(key: string) {
    return await this._storage?.get(key);
  }

  // Remover item específico
  public async remove(key: string) {
    await this._storage?.remove(key);
  }

  // Limpar todos os dados
  public async clear() {
    await this._storage?.clear();
  }

  // Obter todas as chaves
  public async keys() {
    return await this._storage?.keys();
  }
}
