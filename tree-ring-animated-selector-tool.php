<?php
/**
* Plugin Name: Tree Ring Animated Selector Tool
* Plugin URI: https://recodewordpress.com/
* Description: An animated tree ring selector tool.
* Version: 1.0.0
* Author: Nick L
* Author URI: https://recodewordpress.com
* License: GPL2
*/

// Exit if accessed directly
if(!defined('ABSPATH')) exit;

class TreeRingAnimatedSelectorTool {
    public function __construct() {
	    // Add the custom admin page
	    add_action('admin_menu', array($this, 'trast_create_admin_page'));

	    // Handle form submission
	    //add_action('init', array($this, 'trast_handle_form_submit'));

	    // Add the shortcode
	    add_shortcode('tree_ring_hero', array($this, 'trast_render_hero'));

	    // Enqueue ourcripts
	    add_action('wp_enqueue_scripts', array($this, 'trast_enqueue_scripts'));
    
    	//let's create an Ajax action to minimize refreshes on the admin page
        add_action('wp_ajax_trast_save_settings', array($this, 'trast_handle_form_submit'));
	}

	public function trast_enqueue_scripts() {
	    // Enqueue Three.js from a CDN
	    wp_enqueue_script('three-js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.154.0/three.min.js', array(), '154', false);

	    // Enqueue your other scripts that depend on Three.js
	    wp_enqueue_script('tree_ring_selector', plugin_dir_url(__FILE__) . 'js/page_hero.js', array('jquery', 'three-js'), '1.0.0', true);
    
        wp_enqueue_style('trd-hero', plugin_dir_url(__FILE__) . 'css/trd-hero.css', array(), '1.0.0', 'all');
    
    	// Pass the image URL to the JavaScript file
		$image_url = plugin_dir_url(__FILE__) . 'img/gradient.png';
		wp_localize_script('tree_ring_selector', 'pageHeroData', array('imageUrl' => $image_url));
	}

    public function trast_create_admin_page() {
        // Add the admin page under "Appearance"
        add_submenu_page(
            'themes.php',
            'Tree Ring Animation Selection',
            'Tree Ring Selector',
            'manage_options',
            'tree-ring-selector',
            array($this, 'trast_render_admin_page')
        );
    }

	public function trast_render_admin_page() {
	    // Get existing settings
	    $heroTitle = get_option('trast_hero_title', '');
	    $heroSubtitle = get_option('trast_hero_subtitle', '');
	    $heroButtonText = get_option('trast_hero_button_text', '');
		$heroCanvasHeight = get_option('trast_hero_canvas_height', '50vh');

	    echo '<div class="wrap">';
	    echo '<h1>Tree Ring Animation Selection</h1>';
	    echo '<form id="trast-settings-form" method="post" action="">';

	    wp_nonce_field('trast_update_settings', 'trast_settings_nonce');

	    echo '<table class="form-table">';
	    //echo '<tr valign="top"><th scope="row"><label for="trast_hero_title">Hero Title</label></th>';
	    //echo '<td><input type="text" id="trast_hero_title" name="trast_hero_title" value="' . esc_attr($heroTitle) . '" /></td></tr>';
	    
	    //echo '<tr valign="top"><th scope="row"><label for="trast_hero_subtitle">Hero Subtitle</label></th>';
	    //echo '<td><input type="text" id="trast_hero_subtitle" name="trast_hero_subtitle" value="' . esc_attr($heroSubtitle) . '" /></td></tr>';
    
	    //echo '<tr valign="top"><th scope="row"><label for="trast_hero_button_text">Button Text</label></th>';
	    //echo '<td><input type="text" id="trast_hero_button_text" name="trast_hero_button_text" value="' . esc_attr($heroButtonText) . '" /></td></tr>';
		
		echo '<tr valign="top"><th scope="row"><label for="trast_hero_canvas_height">Canvas Height</label></th>';
    	echo '<td><input type="text" id="trast_hero_canvas_height" name="trast_hero_canvas_height" value="' . esc_attr($heroCanvasHeight) . '" /></td></tr>';
	
	    echo '</table>';

	    echo '<p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>';
	    echo '</form>';
	    echo '</div>';

	    echo '<script type="text/javascript">
	        jQuery(document).ready(function($) {
	            $("#trast-settings-form").submit(function(e) {
	                e.preventDefault();

	                var data = $(this).serialize();
	
	                $.post(ajaxurl, data, function(response) {
	                    if(response.success) {
	                        alert("Settings saved successfully.");
	                    } else {
	                        alert("Failed to save settings.");
	                    }
	                });
	            });
	        });
	    </script>';
	}

	public function trast_handle_form_submit() {
	    // Check if it's AJAX request
	    $is_ajax = defined('DOING_AJAX') && DOING_AJAX;
    
	    // Verify nonce
	    if (!isset($_POST['trast_settings_nonce']) || !wp_verify_nonce($_POST['trast_settings_nonce'], 'trast_update_settings')) {
	        if ($is_ajax) {
	            wp_send_json_error();
	        }	
	        return;
	    }

	    // Update options
	    update_option('trast_hero_title', sanitize_text_field($_POST['trast_hero_title']));
	    update_option('trast_hero_subtitle', sanitize_text_field($_POST['trast_hero_subtitle']));
	    update_option('trast_hero_button_text', sanitize_text_field($_POST['trast_hero_button_text']));
		update_option('trast_hero_canvas_height', sanitize_text_field($_POST['trast_hero_canvas_height']));

	    if ($is_ajax) {
	        wp_send_json_success();
	    }
	}

public function trast_render_hero() {
    // Get settings
    $heroTitle = get_option('trast_hero_title', '');
    $heroSubtitle = get_option('trast_hero_subtitle', '');
    $heroButtonText = get_option('trast_hero_button_text', '');
    $canvas_height = get_option('trast_hero_canvas_height', '50vh');
	$the_captions = get_field('captions');
    // Get the base URL of this plugin
    $baseURL = plugin_dir_url(__FILE__);
    
    // Include the JavaScript file
    wp_enqueue_script('tree_ring_selector', $baseURL . 'js/page_hero.js', array(), '1.0.0', true);

    // Pass PHP data to JavaScript
    $heroData = array(
        'title' => $heroTitle,
        'subtitle' => $heroSubtitle,
        'buttonText' => $heroButtonText
    );
    wp_localize_script('tree_ring_selector', 'heroData', $heroData);
	
    // Start the container for the hero section
    $output = '<div class="home-banner" id="home-banner">';

    // Add the home-banner-content div
    $output .= '<div class="home-banner-content">';
    $output .= '<div class="columns text-color-white">';
    $output .= '<div class="column">';
	$output .= $the_captions;
	$output .= '</div>';
	$output .= '</div>';
    $output .= '</div>'; // Close .home-banner-content

    $output .= '</div>'; // Close .home-banner

    return $output;
}



}

// Initialize the plugin
new TreeRingAnimatedSelectorTool();
