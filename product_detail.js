
// Trang chi tiết sản phẩm, lấy dữ liệu từ API
$(function() {
  // Lấy id sản phẩm 
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get('id'));
  }
  const id = getProductIdFromUrl();
  if (!id) {
    $('#product-detail').html('<div class="alert alert-warning">Không tìm thấy sản phẩm.</div>');
    return;
  }
  // Tìm sản phẩm trong mảng products
  const product = (typeof products !== 'undefined') ? products.find(p => p.id === id) : null;
  if (!product) {
    $('#product-detail').html('<div class="alert alert-danger">Không tìm thấy sản phẩm.</div>');
    return;
  }
  let html = `
    <div class="row">
      <div class="col-md-5">
        <img src="${product.image}" class="img-fluid mb-3" alt="${product.name}">
      </div>
      <div class="col-md-7">
        <h2>${product.name}</h2>
        <p class="text-danger font-weight-bold">${product.price.toLocaleString()} VNĐ</p>
        <button class="btn btn-primary btn-add-cart" data-id="${product.id}"><i class="fa fa-cart-plus"></i> Thêm vào giỏ</button>
      </div>
    </div>
  `;
  $('#product-detail').html(html);

  // Thêm vào giỏ hàng từ trang chi tiết
  $(document).on('click', '.btn-add-cart', function() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Cập nhật số lượng trên header
    if ($('#cart-count').length) {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      $('#cart-count').text(count);
    }
    alert('Đã thêm vào giỏ hàng!');
  });
});
