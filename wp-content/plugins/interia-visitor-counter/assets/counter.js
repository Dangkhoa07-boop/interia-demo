(function () {
  'use strict';
  function ready() {
    var boxes = document.querySelectorAll('.interia-vc');
    if (!boxes.length || !window.INTERIA_VC || !window.INTERIA_VC.ajaxUrl) return;

    // Exactly one request per document load, even if the footer shortcode
    // appears more than once. Refreshing the browser loads a new document.
    var params = new URLSearchParams({ action: 'interia_vc_hit' });
    fetch(window.INTERIA_VC.ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: params.toString()
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (result) {
        if (!result || !result.success || !result.data) return;
        var data = result.data;
        if (typeof data.total !== 'number' || typeof data.today !== 'number') return;
        var totalText = data.total.toLocaleString('vi-VN');
        var todayText = data.today.toLocaleString('vi-VN');
        boxes.forEach(function (box) {
          var total = box.querySelector('.interia-vc__number--total');
          var today = box.querySelector('.interia-vc__number--today');
          if (total) total.textContent = totalText;
          if (today) today.textContent = todayText;
        });
      })
      .catch(function () { /* Leave last stored values in place on error. */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
