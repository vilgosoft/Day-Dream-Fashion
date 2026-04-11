import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/services/productService';
import type { ProductFilters } from '@/services/productService';
import api from '@/services/api';
import './Shop.scss';

interface FilterOptions {
  categories: { id: number; name: string; slug: string }[];
  sizes: { id: number; name: string }[];
  colors: { id: number; name: string; hex_code: string }[];
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ categories: [], sizes: [], colors: [] });
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const categoryId = searchParams.get('category_id') || '';
  const sizeId = searchParams.get('size_id') || '';
  const colorId = searchParams.get('color_id') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, sizeRes, colorRes] = await Promise.all([
          api.get('/categories'),
          api.get('/admin/sizes').catch(() => ({ data: { data: [] } })),
          api.get('/admin/colors').catch(() => ({ data: { data: [] } })),
        ]);
        setFilterOptions({
          categories: catRes.data?.data || [],
          sizes: sizeRes.data?.data || [],
          colors: colorRes.data?.data || [],
        });
      } catch { /* use empty defaults */ }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters: ProductFilters = { page, limit: 12, ...(sort && { sort }) };
        if (categoryId) filters.category = categoryId;
        if (sizeId) filters.size = sizeId;
        if (colorId) filters.color = colorId;
        if (minPrice) filters.min_price = parseFloat(minPrice);
        if (maxPrice) filters.max_price = parseFloat(maxPrice);

        const params: Record<string, any> = { ...filters };
        if (search) params.search = search;
        if (searchParams.get('featured')) params.featured = true;
        if (searchParams.get('trending')) params.trending = true;

        const res = await productService.getAll(params);
        setProducts(res.data?.data || []);
        setTotalPages(res.data?.meta?.last_page || 0);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = categoryId || sizeId || colorId || minPrice || maxPrice || search;

  return (
    <div className="shop">
      <div className="shop__container">
        <div className="shop__header">
          <h1 className="shop__title">Shop</h1>
          <div className="shop__controls">
            <button className="shop__filter-toggle" onClick={() => setMobileFiltersOpen(true)}>
              <FiFilter /> Filters
            </button>
            <select
              className="shop__sort"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>
        </div>

        <div className="shop__layout">
          {/* Sidebar Filters */}
          <aside className={`shop__sidebar ${mobileFiltersOpen ? 'shop__sidebar--open' : ''}`}>
            <div className="shop__sidebar-header">
              <h3>Filters</h3>
              <button className="shop__sidebar-close" onClick={() => setMobileFiltersOpen(false)}>
                <FiX />
              </button>
            </div>

            {hasActiveFilters && (
              <button className="shop__clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}

            {/* Search */}
            <div className="shop__filter-group">
              <h4>Search</h4>
              <input
                type="text"
                placeholder="Search products..."
                className="shop__filter-input"
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Categories */}
            {filterOptions.categories.length > 0 && (
              <div className="shop__filter-group">
                <h4>Category</h4>
                <div className="shop__filter-list">
                  <label className="shop__filter-option">
                    <input type="radio" name="category" checked={!categoryId} onChange={() => updateFilter('category_id', '')} />
                    <span>All Categories</span>
                  </label>
                  {filterOptions.categories.map((cat) => (
                    <label key={cat.id} className="shop__filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={categoryId === String(cat.id)}
                        onChange={() => updateFilter('category_id', String(cat.id))}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {filterOptions.sizes.length > 0 && (
              <div className="shop__filter-group">
                <h4>Size</h4>
                <div className="shop__filter-chips">
                  {filterOptions.sizes.map((size) => (
                    <button
                      key={size.id}
                      className={`shop__chip ${sizeId === String(size.id) ? 'shop__chip--active' : ''}`}
                      onClick={() => updateFilter('size_id', sizeId === String(size.id) ? '' : String(size.id))}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {filterOptions.colors.length > 0 && (
              <div className="shop__filter-group">
                <h4>Color</h4>
                <div className="shop__filter-colors">
                  {filterOptions.colors.map((color) => (
                    <button
                      key={color.id}
                      className={`shop__color-swatch ${colorId === String(color.id) ? 'shop__color-swatch--active' : ''}`}
                      style={{ backgroundColor: color.hex_code }}
                      title={color.name}
                      onClick={() => updateFilter('color_id', colorId === String(color.id) ? '' : String(color.id))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="shop__filter-group">
              <h4>Price Range</h4>
              <div className="shop__price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="shop__filter-input shop__filter-input--small"
                  value={minPrice}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="shop__filter-input shop__filter-input--small"
                  value={maxPrice}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="shop__content">
            {loading ? (
              <div className="shop__loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="shop__empty">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                {hasActiveFilters && (
                  <button className="shop__clear-filters" onClick={clearFilters}>Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="shop__grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="shop__pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`shop__page-btn ${p === page ? 'shop__page-btn--active' : ''}`}
                        onClick={() => updateFilter('page', String(p))}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
