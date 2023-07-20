var THREE = window.THREE;

// Create a scene
var scene = new THREE.Scene();

// Get the container
var container = document.getElementById('home-banner');
var containerWidth = container.offsetWidth;
var containerHeight = container.offsetHeight;

// Create a camera
var camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(containerWidth, containerHeight);
container.appendChild(renderer.domElement);

// Create the gradient background
var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load(pageHeroData.imageUrl);
var perlinNoise = `
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }
    vec4 taylorInvSqrt(vec4 r)
    {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }
    // Classic Perlin noise
    float cnoise(vec3 P)
    {
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
    }
`;

var vertexShader = `
    ${perlinNoise}
	precision highp float;
    uniform float time;
    uniform vec2 mouse;
    varying vec2 vUv;
    varying float vWave;
    float PI = 3.1415926535897932384626433832795;
    void main() {
        vec3 pos = position;
        float dist = distance(mouse, pos.xy);
        vWave = 0.5 * sin(1.0 * PI * (dist - 1.0 * time));
        pos.z += vWave;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;
var fragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;

	vec3 startColor = vec3(43.0/255.0, 105.0/255.0, 132.0/255.0);  // Color #2B6984
	vec3 randomColor = vec3(43.0/255.0, 105.0/255.0, 132.0/255.0); // Same color #2B6984
	vec3 lightestColor = vec3(44.0/255.0, 101.0/255.0, 102.0/255.0); // Color #2C6566
	float whiteIntensity = 0.6; // Adjust the white intensity (0.0 - 1.0)

	void main() {
    	vec4 texColor = texture2D(uTexture, vUv);
    	float wave = abs(sin(vWave));

    	// Check if the texture color is fully transparent or if we are scrolling
    	if (texColor.a == 0.0) {
    	    gl_FragColor = vec4(startColor, 1.0);
    	} else {
    	    // Adjust the color based on the wave intensity
    	    vec3 color = mix(randomColor, texColor.rgb, wave);
    	    // Add more light color based on the wave intensity
    	    color = mix(color, lightestColor, wave * whiteIntensity);
    	    gl_FragColor = vec4(color, texColor.a);
    	}
	}
`;

var material = new THREE.ShaderMaterial({
uniforms: {
    uTexture: { value: texture },
    time: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) },
    scrolling: { value: false } // new uniform
},
vertexShader,
fragmentShader,
    wireframe: false
});

// Convert window size to Three.js units
var aspectRatio = containerWidth / containerHeight;
var frustumSize = 20; // This can be any number, but it will affect the size of your objects
camera.left = frustumSize * aspectRatio / -2;
camera.right = frustumSize * aspectRatio / 2;
camera.top = frustumSize / 2;
camera.bottom = frustumSize / -2;
camera.updateProjectionMatrix();

var gradient = new THREE.Mesh(new THREE.PlaneGeometry(camera.right - camera.left, camera.top - camera.bottom), material);
gradient.material.depthTest = false;
gradient.material.depthWrite = false;
gradient.renderOrder = -1;
scene.add(gradient);

// Add window resize listener
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    containerWidth = container.offsetWidth;
    containerHeight = container.offsetHeight;
    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    // Remove the old gradient
    scene.remove(gradient);

    // Recreate the gradient
// Recreate the gradient
textureLoader.load(pageHeroData.imageUrl, function(texture) {
    material.uniforms.uTexture.value = texture;
    gradient = new THREE.Mesh(new THREE.PlaneGeometry(camera.right - camera.left, camera.top - camera.bottom), material);
    gradient.material.depthTest = false;
    gradient.material.depthWrite = false;
    gradient.renderOrder = -1;
    scene.add(gradient);
});

}

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value += 0.01;
    renderer.render(scene, camera);
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

window.addEventListener('mousemove', function(e) {
    material.uniforms.mouse.value.x = e.clientX / window.innerWidth;
    material.uniforms.mouse.value.y = 1 - e.clientY / window.innerHeight;
});

var isScrolling = false;

window.addEventListener('touchstart', function(e) {
    isScrolling = false;
}, false);

window.addEventListener('touchmove', function(e) {
    if (isScrolling) return;
    if (e.touches.length > 0) {
        var touch = e.touches[0];
        material.uniforms.mouse.value.x = touch.clientX / window.innerWidth;
        material.uniforms.mouse.value.y = 1 - touch.clientY / window.innerHeight;
    }
}, false);

window.addEventListener('scroll', function(e) {
    isScrolling = true;
    material.uniforms.scrolling.value = true;
}, false);

window.addEventListener('touchend', function(e) {
    isScrolling = false;
    material.uniforms.scrolling.value = false;
}, false);

window.addEventListener('resize', debounce(onWindowResize, 150), false);

animate();
