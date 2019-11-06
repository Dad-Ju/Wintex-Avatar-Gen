$(document).ready((function($){
		var initLayout = function() {
			$('#colorSelector').ColorPicker({
				color: {r:255, g:255, b:255},
				onShow: function (colpkr) {
					$(colpkr).fadeIn(500);
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
					//gwechsel();
					return false;
				},
				onChange: function (hsb, hex, rgb) {
					$('#colorSelector div').css('backgroundColor', '#' + hex);
					//TextColor(rgb);
				},
                onSubmit: function(hsb, hex, rgb){
                    changelogo("namecol", "#" + hex);
                }
			});
            $('#colorSelector2').ColorPicker({
				color: {r:255, g:255, b:255},
				onShow: function (colpkr) {
					$(colpkr).fadeIn(500);
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
					//gwechsel();
					return false;
				},
				onChange: function (hsb, hex, rgb) {
					$('#colorSelector2 div').css('backgroundColor', '#' + hex);
					//TextColor(rgb);
				},
                onSubmit: function(hsb, hex, rgb){
                    changelogo("squadcol", "#" + hex);
                }
			});
		};
		
		EYE.register(initLayout, 'init');
		})(jQuery));