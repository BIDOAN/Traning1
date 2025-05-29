const API_BASE = 'https://dummyjson.com';
const API_PRODUCTS = API_BASE + '/products';
const API_CART = API_BASE + '/carts/1';

// Lấy id sản phẩm từ URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Lấy chi tiết sản phẩm từ API
async function fetchProductDetail(id) {
  const res = await fetch(`${API_PRODUCTS}/${id}`);
  return await res.json();
}

// Thêm vào giỏ hàng qua API và đồng bộ localStorage
async function addToCartAPI(productId) {
  // 1. Gọi API thêm vào giỏ (giả lập)
  await fetch(API_CART + '/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: [{ id: productId, quantity: 1 }] })
  });
  // 2. Đồng bộ localStorage để giao diện cập nhật ngay
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const idx = cart.findIndex(item => item.id === Number(productId));
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    // Lấy thông tin sản phẩm từ API để thêm vào localStorage
    const product = await fetchProductDetail(productId);
    cart.push({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.thumbnail,
      quantity: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  // 3. Cập nhật số lượng trên header ngay
  updateCartCount();
}

// Cập nhật số lượng giỏ hàng trên header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $('#cart-count').text(count);
}

$(async function() {
  const id = getProductIdFromUrl();
  if (!id) {
    $('#product-detail').html('<div class="alert alert-warning">Không tìm thấy sản phẩm.</div>');
    return;
  }
  const product = await fetchProductDetail(id);
  if (!product) {
    $('#product-detail').html('<div class="alert alert-danger">Không tìm thấy sản phẩm.</div>');
    return;
  }
  let html = `
    <div class="row">
      <div class="col-md-5">
        <img src="${product.thumbnail}" class="img-fluid mb-3" alt="${product.title}">
      </div>
      <div class="col-md-7">
        <h2>${product.title}</h2>
        <p class="text-danger font-weight-bold">${product.price.toLocaleString()} VNĐ</p>
        <p>${product.description}</p>
        <button class="btn btn-primary btn-add-cart" data-id="${product.id}"><i class="fa fa-cart-plus"></i> Thêm vào giỏ</button>
      </div>
    </div>
  `;
  $('#product-detail').html(html);

  // Thêm vào giỏ hàng qua API và đồng bộ localStorage
  $(document).on('click', '.btn-add-cart', async function() {
    await addToCartAPI(product.id);
    alert('Đã thêm vào giỏ hàng!');
  });

  // cập nhật số lượng giỏ hàng trên header
  updateCartCount();
});
