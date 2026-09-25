const users = [
  {
    id: 1,
    name: "Meghana",
    email: "meghana@example.com",
    role: "Admin"
  },
  {
    id: 2,
    name: "Adithya",
    email: "adi@example.com",
    role: "User"
  }
];

const products = [
  {
    id: 101,
    name: "Laptop",
    price: 65000,
    stock: 10
  },
  {
    id: 102,
    name: "Wireless Mouse",
    price: 799,
    stock: 50
  }
];

const orders = [
  {
    id: 1001,
    userId: 1,
    productId: 101,
    quantity: 1,
    status: "Delivered"
  },
  {
    id: 1002,
    userId: 2,
    productId: 102,
    quantity: 2,
    status: "Processing"
  }
];

module.exports = {
  users,
  products,
  orders
};