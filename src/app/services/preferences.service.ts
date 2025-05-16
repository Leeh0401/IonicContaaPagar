import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  [key: string]: any; // Para preferências adicionais
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly PREFERENCES_KEY = 'userPreferences';
  private preferencesSubject: BehaviorSubject<UserPreferences>;
  public preferences: Observable<UserPreferences>;

  private defaultPreferences: UserPreferences = {
    theme: 'light',
    notifications: true,
    language: 'pt-BR',
    fontSize: 'medium'
  };

  constructor(private storage: StorageService) {
    this.preferencesSubject = new BehaviorSubject<UserPreferences>(this.defaultPreferences);
    this.preferences = this.preferencesSubject.asObservable();
    this.loadPreferences();
  }

  private async loadPreferences() {
    try {
      const stored = await this.storage.get(this.PREFERENCES_KEY);
      if (stored) {
        this.preferencesSubject.next({ ...this.defaultPreferences, ...stored });
      } else {
        await this.storage.set(this.PREFERENCES_KEY, this.defaultPreferences);
        this.preferencesSubject.next(this.defaultPreferences);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const current = this.preferencesSubject.value;
      const updated = { ...current, ...preferences };
      await this.storage.set(this.PREFERENCES_KEY, updated);
      this.preferencesSubject.next(updated);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  }

  async resetPreferences(): Promise<boolean> {
    try {
      await this.storage.set(this.PREFERENCES_KEY, this.defaultPreferences);
      this.preferencesSubject.next(this.defaultPreferences);
      return true;
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
      return false;
    }
  }

  getCurrentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  async getPreference<T>(key: keyof UserPreferences): Promise<T> {
    const preferences = await this.storage.get(this.PREFERENCES_KEY);
    return preferences ? preferences[key] : this.defaultPreferences[key];
  }

  async setPreference<T>(key: keyof UserPreferences, value: T): Promise<boolean> {
    try {
      const current = this.preferencesSubject.value;
      const updated = { ...current, [key]: value };
      await this.storage.set(this.PREFERENCES_KEY, updated);
      this.preferencesSubject.next(updated);
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar preferência ${key}:`, error);
      return false;
    }
  }
}
