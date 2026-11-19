/* "Visitors by Country" map: countries shaded by visitor count + a ranked list.
 * Markup and data come from ahcfree_render_country_map() (includes/ahcfree-country-map.php);
 * borders from window.AHCFREE_WORLD (js/ahcfree-world.js). */
(function ($) {
	'use strict';

	var COLORS = ['#dbe8f6', '#a9c8ea', '#6fa3d8', '#3a7cc0', '#1d4f8a'];
	var EMPTY = '#e4e8ee';
	var LIST_SIZE = 5;

	function esc(v) {
		return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	function fmt(n) { return (Math.round(Number(n) || 0)).toLocaleString('en-US'); }

	// 5 shades on a square-root scale, so a few big countries do not wash out the rest.
	function shade(v, max) {
		if (!v) return EMPTY;
		if (max <= 1) return COLORS[4];
		return COLORS[Math.min(4, Math.max(0, Math.ceil(Math.sqrt(v / max) * 5) - 1))];
	}

	// Change vs. the previous period, as {cls, text} (null when not comparable).
	function change(c) {
		if (c.p === null || c.p === undefined) return null;
		if (!c.p) return c.v ? { cls: 'new', text: 'New' } : null;
		var pct = Math.round((c.v - c.p) / c.p * 100);
		if (pct === 0) return { cls: 'flat', text: '0%' };
		return { cls: pct > 0 ? 'up' : 'down', text: (pct > 0 ? '▲ ' : '▼ ') + Math.abs(pct) + '%' };
	}

	function init(el) {
		var cfg;
		try { cfg = JSON.parse(el.getAttribute('data-config')); } catch (e) { return; }
		if (!window.L || !window.AHCFREE_WORLD) return;

		var mapEl = el.querySelector('.ahcfree-cmap-map');
		// cfg.list is false when the list is a locked Pro teaser (static sample markup).
		var listEl = cfg.list ? el.querySelector('.ahcfree-cmap-list') : null;
		var moreBtn = cfg.list ? el.querySelector('.ahcfree-cmap-more') : null;
		var sumEl = el.querySelector('.ahcfree-cmap-sum');
		var hiEl = el.querySelector('.ahcfree-cmap-scale .hi');
		var small = el.offsetWidth < 600;
		var data = null, byCode = {}, max = 0, showAll = false;

		var map = L.map(mapEl, {
			zoomControl: false,
			attributionControl: false,
			scrollWheelZoom: false,
			zoomSnap: 0.25,
			minZoom: 0.5,
			maxZoom: 6,
			worldCopyJump: false
		});
		if (!small) L.control.zoom({ position: 'topright' }).addTo(map);

		function style(f) {
			var c = byCode[f.properties.i];
			return { fillColor: shade(c ? c.v : 0, max), fillOpacity: 1, color: '#ffffff', weight: 0.7 };
		}

		function tipHtml(code, name) {
			var c = byCode[code];
			if (!c) return '<b>' + esc(name) + '</b><br>No visitors';
			var share = data.total ? Math.round(c.v / data.total * 100) : 0;
			var ch = change(c);
			return '<b>' + esc(c.n || name) + '</b><br>' + fmt(c.v) + (c.v === 1 ? ' visitor' : ' visitors') + ' · ' + share + '%' +
				(ch ? '<br><span class="' + ch.cls + '">' + esc(ch.text) + '</span> ' + esc(data.cmp) : '');
		}

		// Another plugin may load an older Leaflet over ours: 0.7 names it geoJson and has no tooltips.
		var geoJSON = L.geoJSON || L.geoJson;
		var canTip = typeof L.Layer === 'function' && typeof L.Layer.prototype.bindTooltip === 'function';

		var shapes = {}; // ISO code -> Leaflet layer
		var world = geoJSON(window.AHCFREE_WORLD, {
			// Antarctica only takes room at the bottom of a taller map.
			filter: function (f) { return f.properties.i !== 'AQ'; },
			style: style,
			onEachFeature: function (f, layer) {
				shapes[f.properties.i] = layer;
				if (canTip) layer.bindTooltip(function () { return tipHtml(f.properties.i, f.properties.n); }, { sticky: true, className: 'ahcfree-cmap-tip', direction: 'top', offset: [0, -8] });
				layer.on('mouseover', function () { highlight(f.properties.i, true); });
				layer.on('mouseout', function () { highlight(f.properties.i, false); });
			}
		}).addTo(map);

		// Countries too small for the 1:110m borders (e.g. Singapore) get a dot.
		var dots = L.layerGroup().addTo(map);

		function highlight(code, on) {
			var layer = shapes[code];
			if (layer) {
				layer.setStyle(on ? { color: '#101828', weight: 1.6 } : { color: '#ffffff', weight: 0.7 });
				if (on && layer.bringToFront) layer.bringToFront();
			}
			if (listEl) $(listEl).find('li[data-code="' + code + '"]').toggleClass('is-on', on);
		}

		var baseHeight = mapEl.offsetHeight || 430;
		var mapWrap = el.querySelector('.ahcfree-cmap-mapwrap');
		var sideEl = el.querySelector('.ahcfree-cmap-side');
		function fit() {
			var w = mapEl.offsetWidth;
			var h = baseHeight;
			if (w && w < 600) {
				// Narrow screens: shorter map, so the world fills it instead of floating in empty space.
				h = Math.max(180, Math.min(baseHeight, Math.round(w * 0.6)));
			} else if (sideEl && mapWrap && sideEl.offsetTop === mapWrap.offsetTop) {
				// List beside the map: the map fills its column, which is as tall as
				// the list or, on the dashboard, the space the panel has (the panel is
				// as tall as the summary next to it). Reset first so it can also shrink.
				mapEl.style.height = baseHeight + 'px';
				var body = mapWrap.parentNode;
				h = Math.max(baseHeight, sideEl.offsetHeight, body ? body.clientHeight : 0);
			}
			mapEl.style.height = h + 'px';
			map.invalidateSize();
			map.fitBounds([[-50, -168], [78, 190]], { padding: [4, 4] });
		}

		function renderList() {
			if (!listEl) return;
			var rows = data.countries;
			if (!rows.length) {
				listEl.innerHTML = '<li class="ahcfree-cmap-empty" style="display:block">No visitors in this period yet</li>';
				listEl.classList.remove('is-all');
				if (moreBtn) moreBtn.hidden = true;
				return;
			}
			var shown = showAll ? rows : rows.slice(0, LIST_SIZE);
			var top = rows[0].v || 1;
			listEl.innerHTML = shown.map(function (c) {
				var ch = change(c);
				var share = data.total ? c.v / data.total * 100 : 0;
				return '<li data-code="' + esc(c.c) + '">' +
					'<img src="' + esc(cfg.flags + String(c.c).toLowerCase() + '.png') + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
					'<span class="n" title="' + esc(c.n) + '">' + esc(c.n) + '</span>' +
					'<span class="v">' + fmt(c.v) + '</span>' +
					'<span class="c ' + (ch ? ch.cls : '') + '">' + (ch ? esc(ch.text) : '') + '</span>' +
					'<span class="bar"><i style="width:' + (c.v / top * 100).toFixed(1) + '%"></i></span>' +
					'<span class="p">' + (share >= 1 || share === 0 ? Math.round(share) : '<1') + '%</span></li>';
			}).join('');
			listEl.classList.toggle('is-all', showAll);
			if (moreBtn) {
				moreBtn.hidden = rows.length <= LIST_SIZE;
				moreBtn.textContent = showAll ? 'Show top ' + LIST_SIZE + ' ‹' : 'View all ' + rows.length + ' countries ›';
			}
		}

		function render(d) {
			data = d;
			byCode = {};
			max = 0;
			d.countries.forEach(function (c) {
				byCode[c.c] = c;
				if (c.v > max) max = c.v;
			});
			world.setStyle(style);

			dots.clearLayers();
			d.countries.forEach(function (c) {
				if (shapes[c.c] || (!c.la && !c.lo)) return;
				var dot = L.circleMarker([c.la, c.lo], { radius: 5, color: '#fff', weight: 1, fillColor: shade(c.v, max), fillOpacity: 1 });
				if (canTip) dot.bindTooltip(tipHtml(c.c, c.n), { className: 'ahcfree-cmap-tip', direction: 'top', offset: [0, -6] });
				dot.addTo(dots);
			});

			if (hiEl) hiEl.textContent = fmt(max || 1);
			if (sumEl) {
				var n = d.countries.length;
				var s;
				if (d.range === 'online') {
					s = n ? '<b>' + fmt(d.total) + '</b> ' + (d.total === 1 ? 'visitor' : 'visitors') + ' online now from <b>' + n + '</b> ' + (n === 1 ? 'country' : 'countries') : 'No visitors online right now';
				} else {
					s = n ? '<b>' + fmt(d.total) + '</b> ' + (d.total === 1 ? 'visitor' : 'visitors') + ' from <b>' + n + '</b> ' + (n === 1 ? 'country' : 'countries') : 'No visitors in this period yet';
					if (n && d.cmp) s += ' · ' + esc(d.cmp);
				}
				sumEl.innerHTML = s;
			}
			renderList();
			fit(); // the list height may have changed
		}

		if (listEl) {
			$(listEl).on('mouseenter', 'li[data-code]', function () { highlight(this.getAttribute('data-code'), true); })
				.on('mouseleave', 'li[data-code]', function () { highlight(this.getAttribute('data-code'), false); });
		}
		if (moreBtn) {
			moreBtn.addEventListener('click', function () { showAll = !showAll; renderList(); fit(); });
		}

		// Range switcher (dashboard only).
		var req = null;
		$(el).on('click', '.ahcfree-cmap-seg button', function () {
			if (!cfg.ajax) return;
			var range = this.getAttribute('data-range');
			$(el).find('.ahcfree-cmap-seg button').attr('aria-pressed', 'false');
			this.setAttribute('aria-pressed', 'true');
			el.classList.add('is-loading');
			if (req) req.abort();
			req = $.ajax({
				url: cfg.ajax,
				type: 'POST',
				dataType: 'json',
				data: { action: 'ahcfree_country_map', range: range, ahcfree_nonce: cfg.nonce }
			}).done(function (res) {
				if (res && res.success && res.data) { showAll = false; render(res.data); }
			}).always(function () {
				req = null;
				el.classList.remove('is-loading');
			});
		});

		fit();
		render(cfg.data);
		var t;
		$(window).on('resize', function () { clearTimeout(t); t = setTimeout(fit, 150); });
	}

	$(function () {
		// A failure in one map must never break anything else on the page.
		$('.ahcfree-cmap').each(function () {
			try {
				init(this);
			} catch (e) {
				if (window.console) console.error('Visitors by Country map:', e);
			}
		});
	});
})(jQuery);
