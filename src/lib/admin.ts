export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSession {
  admin: AdminUser;
  token: string;
  expiresAt: string;
}

class AdminService {
  private readonly SESSION_KEY = 'admin_session';
  private readonly TOKEN_KEY = 'admin_token';
  
  // Default admin credentials (in production, use database)
  private readonly defaultAdmin = {
    username: 'admin',
    password: 'admin123', // Change this in production!
    email: 'admin@submonth.com',
    role: 'super_admin' as const
  };

  // Session management
  createSession(admin: AdminUser): AdminSession {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    
    const session: AdminSession = {
      admin,
      token,
      expiresAt
    };

    // Store in localStorage (only in browser environment)
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(this.TOKEN_KEY, token);
    }

    return session;
  }

  getCurrentSession(): AdminSession | null {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return null;
      }
      
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error parsing admin session:', error);
      // Don't call clearSession() here to avoid localStorage access on server
      // Instead, manually clear if we're in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(this.SESSION_KEY);
          localStorage.removeItem(this.TOKEN_KEY);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  hasPermission(permission: string): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    
    return session.admin.permissions.includes(permission) || 
           session.admin.role === 'super_admin';
  }

  clearSession(): void {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<{ success: boolean; error?: string; admin?: AdminUser }> {
    try {
      // For now, use default admin. In production, this would be an API call
      if (username === this.defaultAdmin.username && password === this.defaultAdmin.password) {
        const admin: AdminUser = {
          id: '1',
          username: this.defaultAdmin.username,
          email: this.defaultAdmin.email,
          role: this.defaultAdmin.role,
          permissions: this.getPermissionsForRole(this.defaultAdmin.role),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        this.createSession(admin);
        return { success: true, admin };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  logout(): void {
    this.clearSession();
  }

  // Helper methods
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private getPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'super_admin':
        return [
          'dashboard.view',
          'orders.view', 'orders.manage', 'orders.delete',
          'products.view', 'products.create', 'products.edit', 'products.delete',
          'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
          'hot_deals.view', 'hot_deals.create', 'hot_deals.edit', 'hot_deals.delete',
          'customers.view', 'customers.manage', 'customers.delete',
          'analytics.view', 'analytics.export',
          'settings.view', 'settings.manage',
          'admin.manage'
        ];
      case 'admin':
        return [
          'dashboard.view',
          'orders.view', 'orders.manage',
          'products.view', 'products.create', 'products.edit',
          'categories.view', 'categories.create', 'categories.edit',
          'hot_deals.view', 'hot_deals.create', 'hot_deals.edit',
          'customers.view',
          'analytics.view',
          'settings.view'
        ];
      case 'moderator':
        return [
          'dashboard.view',
          'orders.view',
          'products.view',
          'categories.view',
          'hot_deals.view',
          'customers.view'
        ];
      default:
        return [];
    }
  }

  // Get current admin user
  getCurrentAdmin(): AdminUser | null {
    const session = this.getCurrentSession();
    return session ? session.admin : null;
  }

  // Update last login
  updateLastLogin(): void {
    const session = this.getCurrentSession();
    if (session && typeof window !== 'undefined') {
      session.admin.lastLogin = new Date().toISOString();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }
}

// Singleton instance
export const adminService = new AdminService();
export default adminService;