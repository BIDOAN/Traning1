// main.js - Hiển thị sản phẩm, thêm vào giỏ, cập nhật số lượng giỏ hàng
// Sử dụng JQuery để DOM manipulation

// Hiển thị danh sách sản phẩm dạng card
$(function() {
  if ($('#product-list').length) {
    let html = '';
    products.forEach(product => {
      html += `
        <div class="col-md-3 col-sm-6">
          <div class="card position-relative">
            ${product.label ? `<span class='card-label'>${product.label}</span>` : ''}
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body text-center">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text text-danger font-weight-bold">${product.price.toLocaleString()} VNĐ</p>
              <button class="btn btn-add-cart" data-id="${product.id}"><i class="fa fa-cart-plus"></i> Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      `;
    });
    $('#product-list').html(html);
  }

  // Cập nhật số lượng giỏ hàng trên header
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(count);
  }
  updateCartCount();

  // Thêm vào giỏ hàng
  $(document).on('click', '.btn-add-cart', function() {
    const id = Number($(this).data('id'));
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      const product = products.find(p => p.id === id);
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Đã thêm vào giỏ hàng!');
  });
});

// Hiển thị giỏ hàng, xóa sản phẩm, cập nhật tổng tiền, cập nhật số lượng trên header
$(function() {
  if ($('#cart-list').length) {
    function renderCart() {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        $('#cart-list').html('<div class="alert alert-info">Giỏ hàng trống.</div>');
        $('#cart-total').html('');
        $('#cart-count').text('0');
        return;
      }
      let html = '<div class="table-responsive"><table class="table table-bordered table-hover"><thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead><tbody>';
      let total = 0;
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<tr>
          <td><img src="${item.image}" alt="${item.name}" style="height:60px;"></td>
          <td>${item.name}</td>
          <td>${item.price.toLocaleString()} VNĐ</td>
          <td>${item.quantity}</td>
          <td>${itemTotal.toLocaleString()} VNĐ</td>
          <td><button class="btn btn-danger btn-sm btn-remove" data-id="${item.id}"><i class="fa fa-trash"></i></button></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      $('#cart-list').html(html);
      $('#cart-total').html(`<h5 class="text-right">Tổng cộng: <span class="text-danger">${total.toLocaleString()} VNĐ</span></h5>`);
      $('#cart-count').text(cart.reduce((sum, item) => sum + item.quantity, 0));
    }
    renderCart();
    // Xóa sản phẩm khỏi giỏ
    $('#cart-list').on('click', '.btn-remove', function() {
      const id = Number($(this).data('id'));
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart = cart.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    });
  }
});
