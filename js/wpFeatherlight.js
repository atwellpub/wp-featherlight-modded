/**
 * WP Featherlight - Loader and helpers for the Featherlight WordPress plugin
 *
 * @copyright Copyright (c) 2018, Cipher Development, LLC
 * @license   MIT
 */
(function( window, $, undefined ) {
	'use strict';

	var $body = $( document.body );

	/**
	 * Checks href targets to see if a given anchor is linking to an image.
	 *
	 * @since  0.1.0
	 * @return mixed
	 */
	function testImages( index, element ) {
		return /(.png|.jpg|.jpeg|.gif|.tiff|.bmp)$/.test(
			$( element ).attr( 'href' ).toLowerCase().split( '?' )[0].split( '#' )[0]
		);
	}

	/**
	 * Filters all href elements on a page to add Featherlight's data attribute.
	 * When a match is found, the data attribute is added so Featherlight will
	 * open it normally.
	 *
	 * @since  0.1.0
	 * @return void
	 */
	function findImages() {

		$body.find('article img').each(function() {

			var parent = $(this).parent('a');

			if ( !parent.length ) {
				return;
			}

			var href = parent.attr('href');
			var isYT = ( href.indexOf("youtube") > -1 || href.indexOf("youtu.be") > -1 );
			switch(isYT) {
				case true:

					href = href.replace("watch" , "embed") ;
					href = href.replace("?v=" , "/") ;
					href = href.replace("u.be/" , "ube.com/embed/");
					href = href.replace("t=" , "start=");

					parent.attr('href' , href);

					parent.attr('data-featherlight', "iframe");
					parent.attr('data-featherlight-iframe-width', $(window).width() * 0.80);
					parent.attr('data-featherlight-iframe-height',  $(window).height() * 0.80);
					parent.attr('data-featherlight-iframe-frameborder', 0);
					parent.attr('data-featherlight-iframe-allow', "autoplay; encrypted-media");
					parent.attr('data-featherlight-iframe-allowfullscreen', true);
					parent.attr('data-featherlight-iframe-scrolling', false);
					parent.attr('data-featherlight-iframe-scroll', false);

					break;
				default:
					parent.filter( testImages ).attr( 'data-featherlight', 'image' );
					break;
			}
		});

	}

	/**
	 * Callback function to initialize Featherlight galleries when they contain
	 * items that are able to be opened in a light box.
	 *
	 * @since  0.1.0
	 * @return void
	 */
	function buildGalleries( index, element ) {
		var $galleryObj   = $( element ),
			$galleryItems = $galleryObj.find( 'a[data-featherlight]' );

		if ( $galleryItems.attr( 'data-featherlight' ) ) {
			$galleryItems.featherlightGallery({
				previousIcon: '',
				nextIcon: ''
			});
		}
	}

	/**
	 * Finds and creates Featherlight galleries for WordPress image galleries.
	 *
	 * @since  0.1.0
	 * @return void
	 */
	function findGalleries() {
		var $gallery = $body.find( '[class*="gallery"]' );

		if ( 0 !== $gallery.length ) {
			$.each( $gallery, buildGalleries );
		}
	}

	/**
	 * Attempt to Find image captions using common WordPress caption markup.
	 *
	 * @since  1.3.0
	 * @return void
	 */
	function findCaption( target ) {
		var	caption = target.parent().find( '.wp-caption-text' );

		if ( 0 !== caption.length ) {
			return caption;
		}

		var gutCaption = target.parent().find( 'figcaption' );

		if ( 0 !== gutCaption.length ) {
			return gutCaption;
		}

		var galParent = target.parents( '.gallery-item' );

		if ( 0 !== galParent.length ) {
			return galParent.find( '.wp-caption-text' );
		}

		var gutParent = target.parents( '.blocks-gallery-item' );

		if ( 0 !== gutParent.length ) {
			return gutParent.find( 'figcaption' );
		}

		var jetParent = target.parents( '.tiled-gallery-item' );

		if ( 0 !== jetParent.length ) {
			return jetParent.find( '.tiled-gallery-caption' );
		}

		return '';
	}

	/**
	 * Append image captions to the Featherlight content <div>.
	 *
	 * @since  0.3.0
	 * @return void
	 */
	function addCaptions() {
		$.featherlight.prototype.afterContent = function() {
			var object  = this.$instance,
				caption = findCaption( this.$currentTarget );

			object.find( '.caption' ).remove();

			if ( 0 !== caption.length ) {
				var $captionElm = $( '<div class="caption">' ).appendTo( object.find( '.featherlight-content' ) );
				$captionElm[0].innerHTML = caption.html();
			}
		};
	}

	/**
	 * Fires all of our helper methods to load featherlight.
	 *
	 * @since  0.1.0
	 * @return void
	 */
	function wpFeatherlightInit() {
		$.featherlight.defaults.closeIcon = '';
		findImages();
		findGalleries();
		if ( $body.hasClass( 'wp-featherlight-captions' ) ) {
			addCaptions();
		}
	}

	$( document ).ready(function() {
		wpFeatherlightInit();
	});
})( this, jQuery );
