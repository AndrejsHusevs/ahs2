import React from 'react';


const toKebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};

const CartOverlay = ({ cartItems, onClose, onRemoveItem, onMakeOrder, onIncreaseQuantity, onDecreaseQuantity }) => {
        
    //console.log('Rendering CartOverlay with items: ', cartItems);    

    const totalPrice = cartItems.reduce((total, item) => total + item.product.price_amount * item.quantity, 0).toFixed(2);
    const totalItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="cart-overlay-wrapper">
            <div className="cart-overlay-background" onClick={onClose}></div>
            <div className="cart-overlay">
                <div className="cart-content">
                    <p>My Bag: {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</p>
                    {cartItems.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <div>
                            <ul className="cart-items-list">
                                {cartItems.map((item, index) => {                                    
                                    return (
                                        <li key={index} className="cart-item-row">
                                            <div className="cart-item-column">
                                                <strong>{item.product?.name || 'Unknown Product'}</strong>
                                                <p>{item.product.price_currency_symbol} {item.product.price_amount}</p>
                                                {Object.keys(item.selectedAttributes || {}).map(attrId => {
                                                    
                                                    const attribute = item.selectedAttributes[attrId];
                                                    return (
                                                        <div key={attrId} className="cart-item-attribute" data-testid={`cart-item-attribute-${toKebabCase(attribute?.name)}`}>
                                                            <p>{attribute?.name || 'Unknown Attribute'}:</p>
                                                            <div>
                                                                {attribute.allPossibleAttributeItems.map((attrItem, idx) => {
                                                                    const isSwatch = attribute.type === 'swatch';
                                                                    const backgroundColor = isSwatch ? attrItem.value : '';
                                                                    const isValidColor = /^#[0-9A-F]{6}$/i.test(backgroundColor) || /^(rgb|hsl)a?\((\d{1,3}%?,\s?){3,4}\)$/i.test(backgroundColor);

                                                                    if (isSwatch && !isValidColor) {
                                                                        console.warn(`Invalid color value: ${backgroundColor}`);
                                                                    }

                                                                    const isSelected = attrItem.id === attribute.value;

                                                                    return (
                                                                        <span
                                                                            key={idx}
                                                                            className={`attribute-item-in-cart ${isSelected ? 'selected-item-in-cart' : ''}`}
                                                                            style={isSwatch && isValidColor ? { backgroundColor, width: '24px', height: '24px', display: 'inline-block', margin: '2px' } : { display: 'inline-block', margin: '2px' }}
                                                                            data-testid={`cart-item-attribute-${toKebabCase(attribute?.name)}-${toKebabCase(attrItem.display_value)}${isSelected ? '-selected' : ''}`}
                                                                        >
                                                                            {isSwatch ? '' : attrItem.display_value}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="cart-item-column quantity-column">
                                                <button className="btn btn-secondary btn-sm" data-testid='cart-item-amount-increase' onClick={() => onIncreaseQuantity(index)}>+</button>
                                                <br />
                                                <div className="quantity-in-cart">{item.quantity}</div>
                                                <br />
                                                <button className="btn btn-secondary btn-sm" data-testid='cart-item-amount-decrease' onClick={() => onDecreaseQuantity(index)}>-</button>
                                            </div>
                                            <div className="cart-item-column">
                                                <img src={item.product.gallery[0]} alt={item.product?.name || 'Product Image'} className="cart-item-image" />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <div className="cart-total">
                        <strong>Total</strong>
                        <strong className="total-price" data-testid='cart-total'>{totalPrice}</strong>
                    </div>
                    <button
                        className={`btn ${cartItems.length === 0 ? 'btn-order-disabled' : 'btn-success'}`}
                        onClick={cartItems.length === 0 ? null : onMakeOrder}
                        disabled={cartItems.length === 0}
                    >
                        PLACE ORDER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartOverlay;