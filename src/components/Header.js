import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/brand-icon.png';
import cartIcon from '../assets/shopping-cart.png';
import config from '../config';

const Header = ({ onCategorySelect, onCartClick, categories: propCategories, selectedCategory, cartItems }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            const query = `
                query {
                    categories {
                        id
                        name
                    }
                }
            `;
            try {
                const response = await fetch(config.graphqlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });
                const result = await response.json();
                if (result.errors) {
                    setError('Failed to fetch categories');
                } else {
                    setCategories(result.data.categories);
                }
            } catch (error) {
                setError('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId, categoryName) => {
        onCategorySelect(categoryId);
        navigate(`/${toKebabCase(categoryName)}`);
    };

    const toKebabCase = (str) => {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    };

    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="header">
            <div className="container">
                <div className="row justify-content-between align-items-center">
                    <div className="col">
                        <nav className="nav">
                            {categories.map(category => {
                                return (
                                    <div key={category.id} className="nav-item">
                                        <Link
                                            to={`/${toKebabCase(category.name)}`}
                                            data-testid={`category-name ${selectedCategory === category.id ? 'active-category-link' : 'category-link'}`}
                                            className={`category-name ${selectedCategory === category.id ? 'selected' : ''}`}
                                            onClick={() => handleCategoryClick(category.id, category.name)}
                                        >
                                            {category.name}
                                            {selectedCategory === category.id && <div className="category-underline"></div>}
                                        </Link>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="col text-center">
                        <Link to="/" className="logo-link">
                            <img src={logo} alt="Logo" className="logo-image" />
                        </Link>
                    </div>
                    <div className="col text-right">
                        <button data-testid='cart-btn' className="cart-button" onClick={onCartClick}>
                            <img src={cartIcon} alt="Cart" className="cart-icon" />
                            {totalQuantity > 0 && (
                                <div className="cart-quantity-indicator" data-testid='cart-item-amount'>
                                    {totalQuantity}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;