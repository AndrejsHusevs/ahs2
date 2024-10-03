// src/components/ProductGrid.js
import React, { useState, useEffect } from 'react';
import cartIcon from '../assets/shopping-cart.png';
import config from '../config';

const toKebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};

const ProductGrid = ({ categoryId, onProductSelect, onProductSelectQuick, cartItems }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    console.log('ProductGrid component rendered');
    console.log('categoryId:', categoryId);
    console.log('cartItems:', cartItems);


    useEffect(() => {
        const fetchProducts = async () => {
            const query = `
                query ($categoryId: Int) {
                    products(categoryId: $categoryId) {
                        id
                        name                        
                        gallery
                        price_amount                        
                        price_currency_symbol
                        instock
                    }
                }
            `;
            try {
                const response = await fetch(config.graphqlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query, variables: { categoryId } }),
                });
                const result = await response.json();
                if (result.errors) {
                    setError('Failed to fetch products');
                } else {
                    setProducts(result.data.products);
                }
            } catch (error) {
                setError('Failed to fetch products');
            }
        };

        const fetchCategoryName = async (categoryId) => {
            if (!categoryId) {
                categoryId = 0;
            }
        
            const query = `
                query ($categoryId: Int!) {
                    categories(id: $categoryId) {
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
                    body: JSON.stringify({ query, variables: { categoryId } }),
                });
                const result = await response.json();
                console.log(result); // Debugging: Log the result to see the structure
        
                if (result.errors && result.errors.length > 0) {
                    console.error(result.errors); // Log the errors for debugging
                    setError('Failed to fetch category name (1)');
                } else {
                    if (result.data.categories && result.data.categories.length > 0) {
                        setCategoryName(result.data.categories[0].name);
                    } else {
                        setError('Category not found');
                    }
                }
            } catch (error) {
                console.error(error); // Log the error for debugging
                setError('Failed to fetch category name (2)');
            }
        };

        fetchProducts();
        fetchCategoryName(categoryId);
    }, [categoryId]);


    const onAddToCart = (product) => {

        const selectedAttributes = {};
        product.attributes.forEach(attr => {
            selectedAttributes[attr.id] = attr.items[0]; // Select the first item of each attribute
        });

        const productToAdd = {
            ...product,
            selectedAttributes,
            quantity: 1
        };

    };

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <div className="container">
            <h2 className="category-title">{categoryName}</h2>
            <div className="row">
                {products.map((product) => {
                    
                    const isInCart = cartItems.some(item => item.product.id === product.id);
                    return (
                        <div key={product.id} className="col-lg-4 col-md-6 mb-4" data-testid={`product-${toKebabCase(product.name)}`}>
                            <div className="card h-100 noborder" data-testid='product-${product name in kebab case}' onClick={() => onProductSelect(product.id)}>
                                <div className="product-image-container">
                                    <img src={product.gallery[0]} className={`product-image ${!product.instock ? 'out-of-stock' : ''}`} alt={product.name} />
                                    {!product.instock && (
                                            <div className="out-of-stock-overlay">
                                                <span>Out of Stock</span>
                                            </div>
                                    )}
                                    {/*isInCart && (
                                        <div className="cart-indicator">
                                            <img src={cartIcon} alt="In Cart" />
                                        </div>
                                    )*/}
                                    {product.instock && (
                                        <button className="cart-indicator" onClick={(e) => { e.stopPropagation(); onProductSelectQuick(product.id); }}>
                                            <img src={cartIcon} alt="Add To Cart" />
                                        </button>
                                    )}
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text">{product.price_currency_symbol} {product.price_amount}</p>                                   
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductGrid;