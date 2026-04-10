export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
}
