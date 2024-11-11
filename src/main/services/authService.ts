import Store from 'electron-store';
import axios from 'axios';

interface AuthStore {
  token: string | null;
}

export class AuthService {
  private store: Store<AuthStore>;
  private readonly API_URL: string;

  constructor() {
    this.store = new Store<AuthStore>({
      name: 'auth',
      schema: {
        token: {
          type: ['string', 'null'],
          default: null,
        },
      },
    });

    this.API_URL = process.env.API_URL || 'https://api.uopca.com';
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        this.store.set('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  getToken(): string | null {
    return this.store.get('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.store.clear();
  }
}
