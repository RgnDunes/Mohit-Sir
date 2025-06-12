import "./App.css";
import { useEffect, useState } from "react";
import { getDashboardData } from "./service/fetchData.js";

export default function App() {
  // State for dashboard data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // State for sorting
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // State for filtering
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Function to fetch data with current parameters
  const fetchData = async () => {
    setLoading(true);
    try {
      // Create filters object for API call
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (minPrice > 0) filters.minPrice = minPrice;
      if (maxPrice < priceRange.max) filters.maxPrice = maxPrice;

      // Fetch data from API
      const response = await getDashboardData(
        currentPage,
        itemsPerPage,
        sortBy,
        sortOrder,
        filters
      );

      // Update state with response data
      setItems(response.data);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setCategories(response.filters.categories);
      setPriceRange(response.filters.priceRange);

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      setLoading(false);
      console.error(err);
    }
  };

  // Load data on initial render and when parameters change
  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    selectedCategory,
    minPrice,
    maxPrice,
  ]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle sort change
  const handleSortChange = (column) => {
    // If clicking the same column, toggle order; otherwise, set new column with asc order
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle price filter change
  const handleMinPriceChange = (e) => {
    setMinPrice(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSortBy("id");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Helper to render sort indicator
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Previous
      </button>
    );

    // Page number buttons
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* Filters section */}
      <div className="filters-container">
        <h2>Filters</h2>

        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range:</label>
          <div className="price-inputs">
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              min={priceRange.min}
              max={maxPrice}
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              min={minPrice}
              max={priceRange.max}
              placeholder="Max"
            />
          </div>
        </div>

        <button onClick={clearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      </div>

      {/* Data table */}
      <div className="table-container">
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="table-controls">
              <div className="items-per-page">
                <label>Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="showing-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} items
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange("id")}>
                    ID{renderSortIndicator("id")}
                  </th>
                  <th onClick={() => handleSortChange("name")}>
                    Name{renderSortIndicator("name")}
                  </th>
                  <th onClick={() => handleSortChange("category")}>
                    Category{renderSortIndicator("category")}
                  </th>
                  <th onClick={() => handleSortChange("price")}>
                    Price{renderSortIndicator("price")}
                  </th>
                  <th onClick={() => handleSortChange("stock")}>
                    Stock{renderSortIndicator("stock")}
                  </th>
                  <th onClick={() => handleSortChange("rating")}>
                    Rating{renderSortIndicator("rating")}
                  </th>
                  <th onClick={() => handleSortChange("date")}>
                    Date{renderSortIndicator("date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>${item.price}</td>
                      <td>{item.stock}</td>
                      <td>{item.rating}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination-container">
              {renderPaginationButtons()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
