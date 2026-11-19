/*
 * Visitor Traffic Real Time Statistics - front-end tracker (8.18).
 *
 * 1. Records the page view (ahcfree_track_visitor), but only when a real person
 *    can see the page:
 *      - automated browsers (navigator.webdriver) are ignored;
 *      - pages PRERENDERED by the browser are not counted until the visitor
 *        actually opens them. Chrome prerenders top Google results, so before
 *        8.18 every prerender was counted as a "search engine visit".
 * 2. Measures ENGAGED time: seconds while the tab is visible and the visitor
 *    interacted in the last 2 minutes. It is reported to
 *    ahcfree_track_engagement every 60s while engaged and when the page is
 *    hidden / closed (sendBeacon). Idle or background tabs add nothing.
 *
 * No jQuery, no WordPress Heartbeat.
 */
(function () {
    'use strict';

    if (typeof ahc_ajax_front === 'undefined' || !ahc_ajax_front.ajax_url) {
        return;
    }
    if (navigator.webdriver) {
        return;
    }

    var cfg = ahc_ajax_front;
    var IDLE_LIMIT = 120000;  // ms without interaction before time stops counting
    var REPORT_EVERY = 60000; // ms between periodic reports while engaged

    function str(v) {
        return (v === null || v === undefined) ? '' : String(v);
    }

    function encode(params) {
        var out = [];
        for (var k in params) {
            if (Object.prototype.hasOwnProperty.call(params, k)) {
                out.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
            }
        }
        return out.join('&');
    }

    // ---------------------------------------------------------------- engagement
    var hitId = 0, token = '';
    var engagedMs = 0, reportedSec = 0;
    var lastTick = 0, lastActivity = Date.now();

    function isEngaged(now) {
        return document.visibilityState === 'visible' && (now - lastActivity) < IDLE_LIMIT;
    }

    function tick() {
        var now = Date.now();
        if (lastTick && isEngaged(now)) {
            // Never credit more than the idle window for one gap (sleeping laptop...).
            engagedMs += Math.min(now - lastTick, IDLE_LIMIT);
        }
        lastTick = now;
    }

    function report(useBeacon) {
        tick();
        if (!hitId) {
            return;
        }
        var total = Math.floor(engagedMs / 1000);
        var delta = total - reportedSec;
        if (delta < 1) {
            return;
        }
        reportedSec = total;
        var body = encode({ action: 'ahcfree_track_engagement', hit: hitId, token: token, s: delta });

        if (useBeacon && navigator.sendBeacon) {
            try {
                var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
                if (navigator.sendBeacon(cfg.ajax_url, blob)) {
                    return;
                }
            } catch (e) { /* fall through to XHR */ }
        }
        var x = new XMLHttpRequest();
        x.open('POST', cfg.ajax_url, true);
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.send(body);
    }

    function startEngagement() {
        lastTick = Date.now();
        lastActivity = Date.now();

        var markActive = function () {
            var now = Date.now();
            // Resuming after an idle period: start counting from now.
            if (now - lastActivity >= IDLE_LIMIT) {
                lastTick = now;
            }
            lastActivity = now;
        };
        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) {
            window.addEventListener(ev, markActive, { passive: true, capture: true });
        });

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                report(true);
            } else {
                lastTick = Date.now();
                lastActivity = Date.now();
            }
        });
        window.addEventListener('pagehide', function () { report(true); });

        setInterval(function () {
            if (isEngaged(Date.now())) {
                report(false);
            } else {
                tick();
            }
        }, REPORT_EVERY);
    }

    // ------------------------------------------------------------------ page view
    function trackPageView() {
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', cfg.ajax_url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState !== 4 || xhttp.status !== 200) {
                return;
            }
            try {
                var res = JSON.parse(xhttp.responseText);
                if (res && res.ok && res.hit && res.token) {
                    hitId = res.hit;
                    token = res.token;
                }
            } catch (e) { /* old/odd response: page view is recorded, no engagement */ }
        };
        xhttp.send(encode({
            action: 'ahcfree_track_visitor',
            page_id: str(cfg.page_id),
            page_title: str(cfg.page_title),
            post_type: str(cfg.post_type),
            referer: document.referrer,
            useragent: navigator.userAgent,
            servername: location.hostname,
            hostname: location.host,
            request_uri: location.pathname.substring(1),
            search_term: str(cfg.search_term),
            search_results: str(cfg.search_results)
        }));

        startEngagement();
    }

    // A prerendered page runs this script before (or without) the visitor ever
    // seeing it. Wait until it is actually activated.
    if (document.prerendering) {
        document.addEventListener('prerenderingchange', trackPageView, { once: true });
    } else {
        trackPageView();
    }
})();
