import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Sample inventory data
const sampleProducts = [
  { id: 'p1', name: 'Classic Milk Tea', category: 'Milk Tea', stockLevel: 100, minStock: 20, unit: 'cups' },
  { id: 'p2', name: 'Taro Milk Tea', category: 'Milk Tea', stockLevel: 85, minStock: 20, unit: 'cups' },
  { id: 'p3', name: 'Mango Green Tea', category: 'Fruit Tea', stockLevel: 75, minStock: 15, unit: 'cups' },
  { id: 'p4', name: 'Strawberry Green Tea', category: 'Fruit Tea', stockLevel: 60, minStock: 15, unit: 'cups' },
  { id: 'p5', name: 'Brown Sugar Boba Tea', category: 'Special Drinks', stockLevel: 50, minStock: 10, unit: 'cups' },
  { id: 'p6', name: 'Matcha Latte', category: 'Special Drinks', stockLevel: 45, minStock: 10, unit: 'cups' }
];

const sampleIngredients = [
  { id: 'i1', name: 'Black Tea', stockLevel: 5000, minStock: 1000, unit: 'g' },
  { id: 'i2', name: 'Green Tea', stockLevel: 4500, minStock: 1000, unit: 'g' },
  { id: 'i3', name: 'Milk', stockLevel: 20, minStock: 5, unit: 'L' },
  { id: 'i4', name: 'Tapioca Pearls', stockLevel: 3000, minStock: 500, unit: 'g' },
  { id: 'i5', name: 'Taro Powder', stockLevel: 2000, minStock: 400, unit: 'g' },
  { id: 'i6', name: 'Mango Syrup', stockLevel: 1800, minStock: 300, unit: 'ml' },
  { id: 'i7', name: 'Strawberry Syrup', stockLevel: 1700, minStock: 300, unit: 'ml' },
  { id: 'i8', name: 'Brown Sugar Syrup', stockLevel: 2500, minStock: 400, unit: 'ml' },
  { id: 'i9', name: 'Matcha Powder', stockLevel: 1000, minStock: 200, unit: 'g' },
  { id: 'i10', name: 'Grass Jelly', stockLevel: 1500, minStock: 300, unit: 'g' }
];

const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventoryView, setInventoryView] = useState('products'); // 'products' or 'ingredients'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter items based on search term
  const filteredProducts = sampleProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredIngredients = sampleIngredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Inventory Management</h1>
        <div className="user-info">
          <span>{user?.name || 'User'}</span>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <div className="page-content">
        <div className="inventory-controls">
          <div className="view-options">
            <button 
              className={inventoryView === 'products' ? 'active' : ''}
              onClick={() => setInventoryView('products')}
            >
              Products
            </button>
            <button 
              className={inventoryView === 'ingredients' ? 'active' : ''}
              onClick={() => setInventoryView('ingredients')}
            >
              Ingredients
            </button>
          </div>
          
          <div className="search-filter">
            <input
              type="text"
              placeholder={`Search ${inventoryView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {inventoryView === 'products' ? (
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Min. Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.stockLevel}</td>
                    <td>{product.minStock}</td>
                    <td>{product.unit}</td>
                    <td>
                      <span className={`status ${product.stockLevel <= product.minStock ? 'low' : 'normal'}`}>
                        {product.stockLevel <= product.minStock ? 'Low Stock' : 'Normal'}
                      </span>
                    </td>
                    <td>
                      <button className="action-button">Adjust</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Ingredient Name</th>
                  <th>Stock Level</th>
                  <th>Min. Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map(ingredient => (
                  <tr key={ingredient.id}>
                    <td>{ingredient.name}</td>
                    <td>{ingredient.stockLevel}</td>
                    <td>{ingredient.minStock}</td>
                    <td>{ingredient.unit}</td>
                    <td>
                      <span className={`status ${ingredient.stockLevel <= ingredient.minStock ? 'low' : 'normal'}`}>
                        {ingredient.stockLevel <= ingredient.minStock ? 'Low Stock' : 'Normal'}
                      </span>
                    </td>
                    <td>
                      <button className="action-button">Adjust</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="inventory-actions">
          <button className="primary-button">Add {inventoryView === 'products' ? 'Product' : 'Ingredient'}</button>
          <button className="secondary-button">Export Data</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;