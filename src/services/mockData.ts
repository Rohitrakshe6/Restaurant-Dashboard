import type { Table, MenuItem } from '../types';

export const mockTables: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'available' },
  { id: 't2', number: 2, capacity: 4, status: 'available' },
  { id: 't3', number: 3, capacity: 4, status: 'available' },
  { id: 't4', number: 4, capacity: 6, status: 'available' },
  { id: 't5', number: 5, capacity: 2, status: 'available' },
  { id: 't6', number: 6, capacity: 8, status: 'available' },
  { id: 't7', number: 7, capacity: 4, status: 'available' },
  { id: 't8', number: 8, capacity: 4, status: 'available' },
];

export const mockMenu: MenuItem[] = [
  { id: 'm1', name: 'Paneer Tikka', category: 'Starters', price: 250, isVeg: true, spicyLevel: 2 },
  { id: 'm2', name: 'Chicken 65', category: 'Starters', price: 320, isVeg: false, spicyLevel: 3 },
  { id: 'm3', name: 'Samosa Chaat', category: 'Starters', price: 150, isVeg: true },
  { id: 'm4', name: 'Butter Chicken', category: 'Mains', price: 450, isVeg: false, spicyLevel: 1 },
  { id: 'm5', name: 'Dal Makhani', category: 'Mains', price: 280, isVeg: true },
  { id: 'm6', name: 'Palak Paneer', category: 'Mains', price: 310, isVeg: true, spicyLevel: 1 },
  { id: 'm7', name: 'Garlic Naan', category: 'Breads', price: 60, isVeg: true },
  { id: 'm8', name: 'Tandoori Roti', category: 'Breads', price: 30, isVeg: true },
  { id: 'm9', name: 'Chicken Biryani', category: 'Rice', price: 380, isVeg: false, spicyLevel: 2 },
  { id: 'm10', name: 'Jeera Rice', category: 'Rice', price: 160, isVeg: true },
  { id: 'm11', name: 'Gulab Jamun', category: 'Desserts', price: 120, isVeg: true },
  { id: 'm12', name: 'Rasmalai', category: 'Desserts', price: 150, isVeg: true },
  { id: 'm13', name: 'Mango Lassi', category: 'Beverages', price: 100, isVeg: true },
  { id: 'm14', name: 'Masala Chai', category: 'Beverages', price: 50, isVeg: true },
  { id: 'm15', name: 'Mutton Rogan Josh', category: 'Mains', price: 550, isVeg: false, spicyLevel: 2 },
];
