export class AuthTokenUtils {
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
