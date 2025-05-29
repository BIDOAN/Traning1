

// Hiển thị danh sách sản phẩm
$(function() {
  // Hiển thị danh sách sản phẩm
  if (typeof products !== 'undefined' && $('#product-list').length) {
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
  $(document).on('click', '.btn-add-cart', function(e) {
    e.stopPropagation();
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

  // Chuyển sang trang chi tiết khi click card
  $(document).on('click', '.card', function(e) {
    if (!$(e.target).hasClass('btn-add-cart')) {
      const id = $(this).find('.btn-add-cart').data('id');
      if (id) window.location.href = `product_detail.html?id=${id}`;
    }
  });
});

// Hiển thị giỏ hàng, xóa sản phẩm, cập nhật tổng tiền, cập nhật số lượng trên header
$(function() {
  //Quản lý giỏ hàng
  if ($('#cart-list').length) {
    function renderCart() {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart) || cart.length === 0) {
        $('#cart-list').html('<div class="alert alert-info">Giỏ hàng trống.</div>');
        $('#cart-total').html('');
        $('#cart-count').text('0');
        return;
      }
      let html = '<div class="table-responsive"><table class="table table-bordered table-hover"><thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Thành tiền</th><th></th><th></th></tr></thead><tbody>';
      let total = 0;
      cart.forEach(item => {
        if (!item) return;
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<tr>
          <td><img src="${item.image || ''}" alt="${item.name || ''}" style="height:60px;"></td>
          <td>${item.name || ''}</td>
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
      $('#cart-count').text(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
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
    //Sửa số lượng sản phẩm
    $('#cart-list').on('click', '.btn-update', function() {
      const id = Number($(this).data('id'));
      const qty = Number($(this).closest('tr').find('.input-qty').val());
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = cart.findIndex(item => item.id === id);
      if (idx > -1 && qty > 0) {
        cart[idx].quantity = qty;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      }
    });
    // Cho phép sửa số lượng bằng Enter
    $('#cart-list').on('keydown', '.input-qty', function(e) {
      if (e.key === 'Enter') {
        $(this).closest('tr').find('.btn-update').click();
      }
    });
  }
});
