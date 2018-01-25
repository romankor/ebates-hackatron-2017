let macys_product_view = new RegExp('.*www.macys.com\/shop\/product\/.*?ID=([0-9]+).*');
let macys_add_to_cart = new RegExp('.*www.macys.com\/bag\/atbpage.*');
let ebates_hotels = new RegExp('.*www\.ebates\.com\/hotels\/details\/.*\?hotelId=([0-9]+).*');
let macys_prefix = "cr::8333::";

function add_code(code) {
	let wrapper = `
	let readyStateCheckInterval = setInterval(function() {
		if (window.__fb_init !== undefined) {
			clearInterval(readyStateCheckInterval);
			${code}
		}
	}, 10);
	`;
	let s = document.createElement('script');
	s.textContent = wrapper;
	(document.head||document.documentElement).appendChild(s);
	s.remove();
}

function ebates_hotel_view(hotelId) {
	let hotel_view_code = `
		console.log('Track hotel view event ' + ${hotelId});
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'hotel';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = ${hotelId};
    FB.AppEvents.logEvent(
      FB.AppEvents.EventNames.VIEWED_CONTENT,
      null,
			params
    );
	`;
	add_code(hotel_view_code);
}

function product_view(prefix) {
	let product_view_code = `
	  var productId = \"${prefix}\" + MACYS.brightTag.product.productID;
		console.log('FB page view event of product ' + productId);
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'product_group';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = productId;
    FB.AppEvents.logEvent(
      FB.AppEvents.EventNames.VIEWED_CONTENT,
      null,
			params
    );
	`;
	add_code(product_view_code);
}

function add_to_cart(prefix) {
	let add_to_bag_code = `
	  var productId = \"${prefix}\" + MACYS.Bag.addToBagPage.productId;
		console.log('FB add to cart event of product ' + productId);
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'product_group';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = productId;
		FB.AppEvents.logEvent(
			FB.AppEvents.EventNames.ADDED_TO_CART,
			null,
			params
		);
	`;
	add_code(add_to_bag_code);
}

function init_fb(){
	let fb_sript = document.createElement('script');
	fb_sript.src = chrome.extension.getURL('js/script.js');
	fb_sript.onload = function() {this.remove();};
	(document.head || document.documentElement).appendChild(fb_sript);
}

chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		init_fb();
		if (macys_product_view.test(window.location.href)) {
			 product_view(macys_prefix);
		}
		if (macys_add_to_cart.test(window.location.href)) {
			add_to_cart(macys_prefix);
		}

		if (ebates_hotels.test(window.location.href)) {
			ebates_hotel_view(ebates_hotels.exec(window.location.href)[1]);
		}

	}
	}, 10);
});
