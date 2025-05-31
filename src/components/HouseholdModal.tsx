'use client';

import { useState } from 'react';
import { Household } from '@/types';

interface HouseholdModalProps {
  onAdd: (household: Omit<Household, 'id' | 'createdAt' | 'members' | 'tasks'>) => void;
  onClose: () => void;
}

export default function HouseholdModal({ onAdd, onClose }: HouseholdModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    numberOfRooms: 1,
    houseSize: 0,
    numberOfFloors: 1,
    address: '',
    houseType: 'apartment' as const,
    hasGarden: false,
    hasGarage: false,
    hasBasement: false,
    hasAttic: false,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.houseSize > 0) {
      onAdd({
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🏠</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Add New Household</h2>
              <p className="text-gray-400">Create a new household to manage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Household Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Smith Family Home"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                House Type
              </label>
              <select
                value={formData.houseType}
                onChange={(e) => handleInputChange('houseType', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="villa">Villa</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Size & Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Rooms *
              </label>
              <input
                type="number"
                min="1"
                value={formData.numberOfRooms}
                onChange={(e) => handleInputChange('numberOfRooms', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                House Size (m²) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.houseSize}
                onChange={(e) => handleInputChange('houseSize', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Floors *
              </label>
              <input
                type="number"
                min="1"
                value={formData.numberOfFloors}
                onChange={(e) => handleInputChange('numberOfFloors', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g., 123 Main Street, City, Country"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasGarden}
                  onChange={(e) => handleInputChange('hasGarden', e.target.checked)}
                  className="rounded border-gray-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">🌿 Garden</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasGarage}
                  onChange={(e) => handleInputChange('hasGarage', e.target.checked)}
                  className="rounded border-gray-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">🚗 Garage</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBasement}
                  onChange={(e) => handleInputChange('hasBasement', e.target.checked)}
                  className="rounded border-gray-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">🏠 Basement</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAttic}
                  onChange={(e) => handleInputChange('hasAttic', e.target.checked)}
                  className="rounded border-gray-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">🏚️ Attic</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Additional details about the household..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Household
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 