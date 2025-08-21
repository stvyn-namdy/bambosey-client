"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';
import { useAR } from '../../../context/ARContext';
import { useFavorites } from '../../../context/FavoritesContext';
import ARButton from '../../../components/AR/UI/ARButton';
import ARTryOn from '../../../components/AR/ARTryOn/ARTryOn';
import api from '../../../lib/api';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { isARActive } = useAR();
  const { items: favoriteItems, addItem: addToFavorites, removeItem: removeFromFavorites } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const productId = params.id;
  const isFavorite = favoriteItems?.some(item => item.id === parseInt(productId)) || false;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/products/${productId}`);
      const productData = response.data;
      
      if (!productData) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);
      
      // Auto-select first available variant
      if (productData.variants && productData.variants.length > 0) {
        const firstVariant = productData.variants[0];
        setSelectedVariant(firstVariant);
        if (firstVariant.color) setSelectedColor(firstVariant.color);
        if (firstVariant.size) setSelectedSize(firstVariant.size);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError(error.response?.status === 404 ? 'Product not found' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    
    // Find variant with selected color and size (or just color if no size selected)
    const variant = product?.variants?.find(v => 
      v.color?.id === color.id && 
      (selectedSize ? v.size?.id === selectedSize.id : true)
    );
    
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    
    // Find variant with selected color and size
    const variant = product?.variants?.find(v => 
      v.size?.id === size.id && 
      (selectedColor ? v.color?.id === selectedColor.id : true)
    );
    
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      await addItem(
        product,
        quantity,
        selectedVariant?.id,
        product.stockStatus === 'PREORDER_ONLY'
      );
      
      // Show success message
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(parseInt(productId));
    } else {
      addToFavorites({
        id: parseInt(productId),
        name: product.name,
        price: getCurrentPrice(),
        image: product.images?.[0] || '/images/placeholder.png'
      });
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }
    return product?.basePrice || 0;
  };

  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.inventory) {
      return selectedVariant.inventory.quantity;
    }
    return 0;
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    
    const colors = product.variants
      .filter(v => v.color)
      .map(v => v.color)
      .filter((color, index, self) => 
        index === self.findIndex(c => c.id === color.id)
      );
    
    return colors;
  };

  const getAvailableSizes = () => {
    if (!product?.variants) return [];
    
    const sizes = product.variants
      .filter(v => v.size && (!selectedColor || v.color?.id === selectedColor.id))
      .map(v => v.size)
      .filter((size, index, self) => 
        index === self.findIndex(s => s.id === size.id)
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return sizes;
  };

  const getStockStatus = () => {
    if (product?.stockStatus === 'PREORDER_ONLY') {
      return { status: 'preorder', text: 'Available for Preorder', class: 'text-blue-600' };
    }
    
    const stock = getCurrentStock();
    if (stock === 0) {
      return { status: 'out', text: 'Out of Stock', class: 'text-red-600' };
    } else if (stock <= 10) {
      return { status: 'low', text: `Only ${stock} left`, class: 'text-yellow-600' };
    } else {
      return { status: 'in', text: 'In Stock', class: 'text-green-600' };
    }
  };

  const getDisplayImages = () => {
    const images = [];
    
    // Add main product images
    if (product?.images) {
      images.push(...product.images);
    }
    
    // Add variant-specific images
    if (selectedVariant?.images) {
      images.push(...selectedVariant.images);
    }
    
    // Remove duplicates
    const uniqueImages = [...new Set(images)];
    
    return uniqueImages.length > 0 ? uniqueImages : ['/images/placeholder.png'];
  };

  // Prepare AR data for the product
  const getProductARData = () => {
    if (!product) return null;
    
    return {
      id: product.id,
      name: product.name,
      price: getCurrentPrice(),
      images: getDisplayImages().map((img, index) => ({
        url: img,
        type: index === 0 ? 'front' : index === 1 ? 'back' : index === 2 ? 'side' : 'detail'
      })),
      category: product.category?.name || 'totes',
      sku: product.sku,
      variant: selectedVariant
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 mx-auto mb-4"></div>
          <p className="text-gray-200">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            {error === 'Product not found' ? 'Product Not Found' : 'Error Loading Product'}
          </h1>
          <p className="text-gray-400 mb-8">
            {error === 'Product not found' 
              ? "The product you're looking for doesn't exist." 
              : 'Something went wrong while loading the product. Please try again.'
            }
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-100 text-gray-900 px-6 py-2 rounded-md hover:bg-white transition-colors"
            >
              Back to Home
            </button>
            {error !== 'Product not found' && (
              <button
                onClick={loadProduct}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stockInfo = getStockStatus();
  const displayImages = getDisplayImages();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();
  const productARData = getProductARData();

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-200">
                  Home
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-600">/</span>
                  <button 
                    onClick={() => router.push(`/${product.category?.name?.toLowerCase() || 'products'}`)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    {product.category?.name || 'Products'}
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-600">/</span>
                  <span className="text-gray-500 font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image gallery */}
            <div className="flex flex-col-reverse">
              {/* Image selector */}
              {displayImages.length > 1 && (
                <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                  <div className="grid grid-cols-4 gap-6">
                    {displayImages.map((image, index) => (
                      <button
                        key={index}
                        className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50 ${
                          index === selectedImageIndex ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <span className="sr-only">Image {index + 1}</span>
                        <span className="absolute inset-0 rounded-md overflow-hidden">
                          <Image
                            src={image}
                            alt={`Product ${index + 1}`}
                            fill
                            className="w-full h-full object-center object-cover"
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main image */}
              <div className="w-full aspect-square bg-white rounded-lg overflow-hidden relative">
                <Image
                  src={displayImages[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="w-full h-full object-center object-cover"
                  priority
                />
                
                {/* Favorite button */}
                <button
                  onClick={handleToggleFavorite}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <svg
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-100">{product.name}</h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl text-gray-100">${getCurrentPrice()}</p>
              </div>

              {/* Stock status */}
              <div className="mt-3">
                <p className={`text-sm font-medium ${stockInfo.class}`}>
                  {stockInfo.text}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-base text-gray-300 space-y-6">
                  <p>{product.description}</p>
                </div>
              </div>

              <form className="mt-6">
                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-300 font-medium">Color</h3>
                    <fieldset className="mt-2">
                      <legend className="sr-only">Choose a color</legend>
                      <div className="flex items-center space-x-3">
                        {availableColors.map((color) => (
                          <label
                            key={color.id}
                            className={`relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ${
                              selectedColor?.id === color.id ? 'ring-2 ring-gray-300' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="color-choice"
                              value={color.id}
                              className="sr-only"
                              onChange={() => handleColorChange(color)}
                              checked={selectedColor?.id === color.id}
                            />
                            <span
                              className="h-8 w-8 rounded-full border border-gray-600"
                              style={{ backgroundColor: color.hexCode }}
                              title={color.name}
                            />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm text-gray-300 font-medium">Size</h2>
                    </div>

                    <fieldset className="mt-2">
                      <legend className="sr-only">Choose a size</legend>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {availableSizes.map((size) => (
                          <label
                            key={size.id}
                            className={`cursor-pointer border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1 transition-colors ${
                              selectedSize?.id === size.id
                                ? 'bg-gray-100 border-gray-300 text-gray-900'
                                : 'text-gray-300 border-gray-600 hover:border-gray-400 hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name="size-choice"
                              value={size.id}
                              className="sr-only"
                              onChange={() => handleSizeChange(size)}
                              checked={selectedSize?.id === size.id}
                            />
                            {size.name}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm text-gray-300 font-medium">Quantity</h2>
                  </div>
                  <div className="mt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded text-gray-300 hover:bg-gray-800 hover:border-gray-400 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 border border-gray-600 bg-gray-800 text-base text-gray-200 rounded px-2 py-1 text-center focus:border-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded text-gray-300 hover:bg-gray-800 hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 space-y-3">
                  {/* AR Try-On Button */}
                  {productARData && (
                    <ARButton 
                      productData={productARData}
                      className="w-full justify-center"
                    />
                  )}
                  
                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || stockInfo.status === 'out'}
                    className="w-full bg-gray-100 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                  >
                    {addingToCart ? 'Adding...' : stockInfo.status === 'preorder' ? 'Preorder Now' : 'Add to Cart'}
                  </button>
                </div>
              </form>

              {/* Product details */}
              <section className="mt-12 pt-12 border-t border-gray-700 text-xs">
                <h2 className="text-sm font-medium text-gray-200">Product Details</h2>
                <div className="mt-4 prose prose-sm text-gray-400">
                  <ul>
                    <li>SKU: {product.sku}</li>
                    {product.category && <li>Category: {product.category.name}</li>}
                    {selectedVariant && (
                      <>
                        {selectedColor && <li>Color: {selectedColor.name}</li>}
                        {selectedSize && <li>Size: {selectedSize.name}</li>}
                        <li>Stock: {getCurrentStock()} available</li>
                      </>
                    )}
                    {product.allowPreorder && <li>Preorder available</li>}
                    {product.expectedStockDate && (
                      <li>Expected in stock: {new Date(product.expectedStockDate).toLocaleDateString()}</li>
                    )}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* AR Try-On Modal */}
      {isARActive && <ARTryOn />}
    </>
  );
}
