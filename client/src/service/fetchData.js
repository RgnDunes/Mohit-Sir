import axios from "axios";

const buttonhandler = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const getAddition = async (input1, input2) => {
  try {
    const response = await axios.post(`http://localhost:3000/api/add`, {
      num1: input1,
      num2: input2,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching addition:", error);
    throw error;
  }
};

const getSubtraction = async (input1, input2) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/subtract`, {
      params: {
        num1: input1,
        num2: input2,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subtraction:", error);
    throw error;
  }
};

// Function to fetch dashboard data with pagination, filtering, and sorting
const getDashboardData = async (
  page = 1,
  limit = 10,
  sortBy = "id",
  sortOrder = "asc",
  filters = {}
) => {
  try {
    const response = await axios.get("http://localhost:3000/api/dashboard", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        ...filters,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export { buttonhandler, getAddition, getSubtraction, getDashboardData };
