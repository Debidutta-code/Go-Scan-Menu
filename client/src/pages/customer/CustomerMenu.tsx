import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menu.service';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card, Modal } from '@/components/common';
import { Loader } from '@/components/common/Loader';
import { MenuItem, MenuItemAddon, MenuItemVariant } from '../../types/menu.types';
import './CustomerMenu.css';

interface CartItem extends MenuItem {
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddons: MenuItemAddon[];
  selectedCustomizations: Array<{ name: string; value: string }>;
  specialInstructions?: string;
  itemTotal: number;
}

interface MenuData {
  restaurant: any;
  branch: any;
  table?: any;
  categories: Array<{ _id: string; name: string; items: MenuItem[] }>;
}

const CustomerMenu: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams();
  const navigate = useNavigate();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Customization state
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>();
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMenu();
    loadCart();
  }, [restaurantSlug, branchCode, qrCode]);

  const fetchMenu = async () => {
    try {
      let data;
      if (qrCode) {
        data = await menuService.getMenuByQrCode(restaurantSlug!, branchCode!, qrCode);
      } else {
        data = await menuService.getMenuByBranch(restaurantSlug!, branchCode!);
      }
      setMenuData(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (menuData) {
      localStorage.setItem(
        'tableInfo',
        JSON.stringify({
          restaurantId: menuData.restaurant._id,
          branchId: menuData.branch._id,
          tableId: menuData.table?._id,
          tableNumber: menuData.table?.tableNumber,
        })
      );
    }
  };

  const openCustomizeModal = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedVariant(item.variants.find((v) => v.isDefault));
    setSelectedAddons([]);
    setCustomizations({});
    setSpecialInstructions('');
    setQuantity(1);
    setShowCustomizeModal(true);
  };

  const calculateItemTotal = () => {
    if (!selectedItem) return 0;

    let total = selectedVariant?.price || selectedItem.price;
    selectedAddons.forEach((addon) => {
      total += addon.price;
    });
    return total * quantity;
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const customizationsArray = Object.entries(customizations).map(([name, value]) => ({
      name,
      value,
    }));

    const cartItem: CartItem = {
      ...selectedItem,
      quantity,
      selectedVariant,
      selectedAddons: [...selectedAddons],
      selectedCustomizations: customizationsArray,
      specialInstructions,
      itemTotal: calculateItemTotal(),
    };

    const newCart = [...cart, cartItem];
    saveCart(newCart);
    setShowCustomizeModal(false);
  };

  const quickAdd = (item: MenuItem) => {
    if (item.variants.length > 0 || item.addons.length > 0 || item.customizations.length > 0) {
      openCustomizeModal(item);
    } else {
      const cartItem: CartItem = {
        ...item,
        quantity: 1,
        selectedAddons: [],
        selectedCustomizations: [],
        itemTotal: item.price,
      };

      const existingIndex = cart.findIndex(
        (i) => i._id === item._id && i.selectedAddons.length === 0
      );

      let newCart;
      if (existingIndex >= 0) {
        newCart = [...cart];
        newCart[existingIndex].quantity += 1;
        newCart[existingIndex].itemTotal =
          newCart[existingIndex].price * newCart[existingIndex].quantity;
      } else {
        newCart = [...cart, cartItem];
      }
      saveCart(newCart);
    }
  };

  const toggleAddon = (addon: MenuItemAddon) => {
    const exists = selectedAddons.find((a) => a.name === addon.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredItems = () => {
    if (!menuData) return [];

    if (selectedCategory === 'all') {
      return menuData.categories.flatMap((cat) => cat.items);
    }

    const category = menuData.categories.find((cat) => cat._id === selectedCategory);
    return category?.items || [];
  };

  if (loading) {
    return <Loader />;
  }

  if (!menuData) {
    return (
      <div className="error-container">
        <h2>Menu not found</h2>
        <p>The restaurant or branch you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="customer-menu">
      <Navbar
        title={menuData.restaurant.name}
        actions={
          <Button size="sm" onClick={() => navigate('/cart')}>
            🛒 Cart ({getCartItemCount()})
          </Button>
        }
      />

      <div className="menu-header">
        <h1>{menuData.branch.name}</h1>
        {menuData.table && <p className="table-number">Table: {menuData.table.tableNumber}</p>}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {menuData.categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-items-container container">
        <div className="menu-items-grid">
          {filteredItems().map((item) => (
            <Card key={item._id} className="menu-item-card">
              {item.image && (
                <div className="menu-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
              )}
              <div className="menu-item-content">
                <h3 className="menu-item-name">{item.name}</h3>
                {item.description && <p className="menu-item-description">{item.description}</p>}
                {item.spiceLevel && (
                  <div className="menu-item-tags">
                    <span className="spice-tag">
                      {item.spiceLevel === 'mild' && '🌶️'}
                      {item.spiceLevel === 'medium' && '🌶️🌶️'}
                      {item.spiceLevel === 'hot' && '🌶️🌶️🌶️'}
                      {item.spiceLevel === 'extra_hot' && '🌶️🌶️🌶️🌶️'}
                    </span>
                  </div>
                )}
                <div className="menu-item-footer">
                  <div>
                    <span className="menu-item-price">₹{item.price}</span>
                    {item.discountPrice && (
                      <span className="menu-item-discount">₹{item.discountPrice}</span>
                    )}
                  </div>
                  <Button size="sm" disabled={!item.isAvailable} onClick={() => quickAdd(item)}>
                    {item.isAvailable ? 'Add' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {getCartItemCount() > 0 && (
        <button className="floating-cart-btn" onClick={() => navigate('/cart')}>
          🛒
          <span className="floating-cart-badge">{getCartItemCount()}</span>
        </button>
      )}

      {/* Customize Modal */}
      <Modal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        title={selectedItem?.name || ''}
        size="lg"
      >
        {selectedItem && (
          <div className="customize-modal">
            {selectedItem.image && (
              <img src={selectedItem.image} alt={selectedItem.name} className="modal-item-image" />
            )}
            <p className="modal-item-description">{selectedItem.description}</p>

            {/* Variants */}
            {selectedItem.variants.length > 0 && (
              <div className="customize-section">
                <h3>Choose Size/Variant</h3>
                <div className="variant-options">
                  {selectedItem.variants.map((variant) => (
                    <button
                      key={variant.name}
                      className={`variant-option ${selectedVariant?.name === variant.name ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <span>{variant.name}</span>
                      <span>₹{variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {selectedItem.addons.length > 0 && (
              <div className="customize-section">
                <h3>Add Extras</h3>
                <div className="addon-options">
                  {selectedItem.addons.map((addon) => (
                    <label key={addon.name} className="addon-option">
                      <input
                        type="checkbox"
                        checked={selectedAddons.some((a) => a.name === addon.name)}
                        onChange={() => toggleAddon(addon)}
                      />
                      <span>{addon.name}</span>
                      <span>+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Customizations */}
            {selectedItem.customizations.map((custom) => (
              <div key={custom.name} className="customize-section">
                <h3>
                  {custom.name}
                  {custom.isRequired && <span className="required">*</span>}
                </h3>
                <div className="customization-options">
                  {custom.options.map((option) => (
                    <label key={option} className="radio-option">
                      <input
                        type="radio"
                        name={custom.name}
                        value={option}
                        checked={customizations[custom.name] === option}
                        onChange={(e) =>
                          setCustomizations({ ...customizations, [custom.name]: e.target.value })
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Instructions */}
            <div className="customize-section">
              <h3>Special Instructions</h3>
              <textarea
                className="special-instructions"
                placeholder="Any special requests?"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </div>

            {/* Quantity */}
            <div className="quantity-section">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            {/* Total and Add Button */}
            <div className="modal-footer">
              <div className="modal-total">
                <span>Total:</span>
                <span className="total-amount">₹{calculateItemTotal()}</span>
              </div>
              <Button fullWidth size="lg" onClick={addToCart}>
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerMenu;
