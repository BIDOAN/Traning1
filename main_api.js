

const API_BASE = 'https://dummyjson.com';
const API_PRODUCTS = API_BASE + '/products';
const API_CART = API_BASE + '/carts/1'; // Giả lập cart id=1

// Lấy danh sách sản phẩm từ API
async function fetchProducts() {
  const res = await fetch(API_PRODUCTS);
  const data = await res.json();
  return data.products;
}

// Lấy chi tiết sản phẩm từ API
async function fetchProductDetail(id) {
  const res = await fetch(`${API_PRODUCTS}/${id}`);
  return await res.json();
}

// Thêm sản phẩm vào giỏ qua API 
async function addToCartAPI(productId) {
  // Gọi API (giả lập)
  await fetch(API_CART + '/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: [{ id: productId, quantity: 1 }] })
  });
  // Đồng bộ localStorage để giao diện cập nhật ngay
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const idx = cart.findIndex(item => item.id === productId);
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
}

// Xóa sản phẩm khỏi giỏ qua API (giả lập, cập nhật localStorage)
async function removeFromCartAPI(productId) {
  await fetch(API_CART + '/remove', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: [{ id: productId }] })
  });
  // Đồng bộ localStorage
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Sửa số lượng sản phẩm trong giỏ (cập nhật localStorage)
async function updateCartQtyAPI(productId, qty) {
  // Không có API thật, chỉ cập nhật localStorage
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const idx = cart.findIndex(item => item.id === productId);
  if (idx > -1 && qty > 0) {
    cart[idx].quantity = qty;
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

// Lấy giỏ hàng từ localStorage 
async function fetchCart() {
  return { products: JSON.parse(localStorage.getItem('cart') || '[]') };
}

//  Hiển thị sản phẩm trên index/shop 
$(async function() {
  if ($('#product-list').length) {
    const products = await fetchProducts();
    let html = '';
    products.forEach(product => {
      html += `
        <div class="col-md-3 col-sm-6">
          <div class="card position-relative product-card" data-id="${product.id}">
            <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}">
            <div class="card-body text-center">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text text-danger font-weight-bold">${product.price.toLocaleString()} VNĐ</p>
              <button class="btn btn-add-cart" data-id="${product.id}"><i class="fa fa-cart-plus"></i> Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      `;
    });
    $('#product-list').html(html);
  }

  // Chuyển sang trang chi tiết khi click card
  $(document).on('click', '.product-card', function(e) {
    if (!$(e.target).hasClass('btn-add-cart')) {
      const id = $(this).data('id');
      if (id) window.location.href = `product_detail.html?id=${id}`;
    }
  });

  // Thêm vào giỏ qua API
  $(document).on('click', '.btn-add-cart', async function(e) {
    e.stopPropagation();
    const id = Number($(this).data('id'));
    await addToCartAPI(id);
    updateCartCount();
    alert('Đã thêm vào giỏ hàng!');
  });

  // Hiển thị số lượng giỏ hàng trên header
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(count);
  }
  updateCartCount();
});

//  Hiển thị giỏ hàng từ API/localStorage 
$(async function() {
  if ($('#cart-list').length) {
    async function renderCart() {
      const cart = await fetchCart();
      if (!cart.products || cart.products.length === 0) {
        $('#cart-list').html('<div class="alert alert-info">Giỏ hàng trống.</div>');
        $('#cart-total').html('');
        $('#cart-count').text('0');
        return;
      }
      let html = '<div class="table-responsive"><table class="table table-bordered table-hover"><thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Thành tiền</th><th></th><th></th></tr></thead><tbody>';
      let total = 0;
      cart.products.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<tr>
          <td><img src="${item.image || item.thumbnail}" alt="${item.name || item.title}" style="height:60px;"></td>
          <td>${item.name || item.title}</td>
          <td>${item.price ? item.price.toLocaleString() : 0} VNĐ</td>
          <td><input type="number" min="1" class="form-control form-control-sm input-qty" data-id="${item.id}" value="${item.quantity || 1}" style="width:70px;"></td>
          <td>${itemTotal.toLocaleString()} VNĐ</td>
          <td><button class="btn btn-danger btn-sm btn-remove" data-id="${item.id}"><i class="fa fa-trash"></i></button></td>
          <td><button class="btn btn-success btn-sm btn-update" data-id="${item.id}"><i class="fa fa-save"></i></button></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      $('#cart-list').html(html);
      $('#cart-total').html(`<h5 class="text-right">Tổng cộng: <span class="text-danger">${total.toLocaleString()} VNĐ</span></h5>`);
      $('#cart-count').text(cart.products.reduce((sum, item) => sum + (item.quantity || 0), 0));
    }
    await renderCart();
    //  Xóa sản phẩm khỏi giỏ qua API
    $('#cart-list').on('click', '.btn-remove', async function() {
      const id = Number($(this).data('id'));
      await removeFromCartAPI(id);
      await renderCart();
    });
    // Sửa số lượng sản phẩm
    $('#cart-list').on('click', '.btn-update', async function() {
      const id = Number($(this).data('id'));
      const qty = Number($(this).closest('tr').find('.input-qty').val());
      await updateCartQtyAPI(id, qty);
      await renderCart();
    });
    // Cho phép sửa số lượng bằng Enter
    $('#cart-list').on('keydown', '.input-qty', function(e) {
      if (e.key === 'Enter') {
        $(this).closest('tr').find('.btn-update').click();
      }
    });
  }
});
