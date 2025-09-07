import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Set up camera
const camera = new THREE.PerspectiveCamera(
    12,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 14);

// Create scene
const scene = new THREE.Scene();
let planeModel;
let mixer;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(300, 400, 200);
scene.add(dirLight);

// Load a plane model and animate
const loader = new GLTFLoader();
const planeCandidates = [
    'img/stylized_ww1_plane.glb',
    'img/wwii_cartoon_plane_free.glb',
    'img/sukhoi_su-75.glb',
    'img/c17__transport_aircraft.glb',
    'img/cargo_aircraft.glb',
];

function loadPlaneModel(index = 0) {
    if (index >= planeCandidates.length) return;
    loader.load(
        planeCandidates[index],
        (gltf) => {
            planeModel = gltf.scene;
            scene.add(planeModel);

            // Scale model based on its bounding box
            const box = new THREE.Box3().setFromObject(planeModel);
            const size = new THREE.Vector2();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scaleFactor = 2 / maxDim;
            planeModel.scale.setScalar(scaleFactor);

            // Initial off-screen position to the left
            planeModel.position.set(-12, 1.2, 0);
            planeModel.rotation.set(0.05, Math.PI * 0.5, 0.05);

            // Play animation if available
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(planeModel);
                mixer.clipAction(gltf.animations[0]).play();
            }

            // Glide-in animation from left
            gsap.to(planeModel.position, {
                x: 0,
                duration: 3.2,
                ease: 'power2.out',
                delay: 0.2,
            });

            gsap.to(planeModel.rotation, {
                y: Math.PI * 0.0,
                x: 0.02,
                z: -0.02,
                duration: 3.2,
                ease: 'power2.out',
                delay: 0.2,
            });
        },
        undefined,
        () => loadPlaneModel(index + 1)
    );
}

loadPlaneModel();

// Scroll-driven descent
function onScroll() {
    if (!planeModel) return;

    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || window.pageYOffset;
    const maxScroll = doc.scrollHeight - doc.clientHeight || 1;
    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));

    // Split into 6 equal sections
    let targetX = 0;
    const section = 1 / 6;
    if (progress < section) {
        // Section 1: Move left (-2)
        targetX = -2 * (progress / section);
    } else if (progress < 2 * section) {
        // Section 2: Move right (+2)
        targetX = -2 + 4 * ((progress - section) / section);
    } else if (progress < 3 * section) {
        // Section 3: Move left (-2)
        targetX = 2 - 4 * ((progress - 2 * section) / section);
    } else if (progress < 4 * section) {
        // Section 4: Move right (+2)
        targetX = -2 + 4 * ((progress - 3 * section) / section);
    } else if (progress < 5 * section) {
        // Section 5: Move left (-2)
        targetX = 2 - 4 * ((progress - 4 * section) / section);
    } else {
        // Section 6: Move right to center (0)
        targetX = -2 + 2 * ((progress - 5 * section) / section);
    }

    // Vertical & depth movement
    const targetY = -progress * 0.5; // fly down as you scroll
    const targetZ = -progress * 2; // slight depth change
    const targetRotX = 0.02 + progress * 0.15; // nose down

    // Animate with GSAP
    gsap.to(planeModel.position, { 
        x: targetX, 
        y: targetY, 
        z: targetZ, 
        duration: 0.5, 
        ease: 'power1.out' 
    });

    gsap.to(planeModel.rotation, { 
        x: targetRotX, 
        duration: 0.5, 
        ease: 'power1.out' 
    });
}

// Animation loop
function tick() {
    requestAnimationFrame(tick);
    if (mixer) mixer.update(0.02);
    renderer.render(scene, camera);
}
tick();

// Events
window.addEventListener('scroll', onScroll);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const track = document.getElementById('logosTrack');
const logos = [...track.children];
logos.forEach(logo => {
    const clone = logo.cloneNode(true);
    track.appendChild(clone);
  });


document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('header nav').classList.toggle('show');
});


 document.addEventListener('DOMContentLoaded', function () {
            // --- DOM Element Selection ---
            const sliderContainer = document.querySelector('.slider-container');
            const slider = document.querySelector('.slider');
            const slides = document.querySelectorAll('.service-slide');
            const dotsContainer = document.querySelector('.dots-container');

            // --- State Variables ---
            let currentIndex = 0;
            const totalSlides = slides.length;
            let autoPlayInterval;
            let isScrolling = false; // Flag to prevent rapid scrolling

            // --- Functions ---

            /**
             * Creates pagination dots based on the number of slides.
             */
            function createDots() {
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    dot.addEventListener('click', () => {
                        goToSlide(i);
                        resetAutoPlay();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            /**
             * Updates the active state of the pagination dots.
             */
            function updateDots() {
                const dots = document.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }

            /**
             * Moves the slider to the specified slide index.
             * @param {number} index - The index of the slide to show.
             */
            function goToSlide(index) {
                if (isScrolling) return; // Prevent action if already scrolling
                isScrolling = true;

                // Handle looping from last to first and first to last
                currentIndex = (index + totalSlides) % totalSlides;
                
                // Move the slider vertically using CSS transform
                slider.style.transform = `translateY(-${currentIndex * 100}%)`;
                updateDots();

                // Reset scrolling flag after transition ends
                setTimeout(() => {
                    isScrolling = false;
                }, 800); // Should be slightly longer than CSS transition
            }

            /**
             * Starts the automatic sliding.
             */
            function startAutoPlay() {
                autoPlayInterval = setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, 2000); // Change slide every 2 seconds
            }

            /**
             * Resets the autoplay timer. Called on manual navigation.
             */
            function resetAutoPlay() {
                clearInterval(autoPlayInterval);
                startAutoPlay();
            }

            // --- Event Listeners ---

            // Listen for mouse wheel scroll on the container
            sliderContainer.addEventListener('wheel', (event) => {
                event.preventDefault(); // Prevent page from scrolling
                if (isScrolling) return;

                if (event.deltaY > 0) {
                    // Scrolling down
                    goToSlide(currentIndex + 1);
                } else {
                    // Scrolling up
                    goToSlide(currentIndex - 1);
                }
                resetAutoPlay();
            });
            
            // --- Initialization ---
            createDots();
            goToSlide(0); // Initialize slider at the first slide
            startAutoPlay();
        });


        document.addEventListener('DOMContentLoaded', function () {
            // --- DOM Element Selection ---
            const sliderContainer = document.querySelector('.what-we-do-container');
            const slider = document.querySelector('#wwdSlider');
            const slides = document.querySelectorAll('.wwd-slide');
            const dotsContainer = document.querySelector('.wwd-dots-container');

            // --- State Variables ---
            let currentIndex = 0;
            const totalSlides = slides.length;
            let autoPlayInterval;
            let isScrolling = false; // Flag to prevent rapid scrolling

            // --- Functions ---

            /**
             * Creates pagination dots based on the number of slides.
             */
            function createDots() {
                // Clear existing dots before creating new ones
                dotsContainer.innerHTML = '';
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('wwd-dot');
                    dot.addEventListener('click', () => {
                        goToSlide(i);
                        resetAutoPlay();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            /**
             * Updates the active state of the pagination dots.
             */
            function updateDots() {
                const dots = document.querySelectorAll('.wwd-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }

            /**
             * Moves the slider to the specified slide index.
             * @param {number} index - The index of the slide to show.
             */
            function goToSlide(index) {
                if (isScrolling) return; // Prevent action if already scrolling
                isScrolling = true;

                // Handle looping from last to first and first to last
                currentIndex = (index + totalSlides) % totalSlides;
                
                // Move the slider vertically using CSS transform
                slider.style.transform = `translateY(-${currentIndex * 100}%)`;
                updateDots();

                // Reset scrolling flag after transition ends
                setTimeout(() => {
                    isScrolling = false;
                }, 800); // Should be slightly longer than CSS transition
            }

            /**
             * Starts the automatic sliding.
             */
            function startAutoPlay() {
                autoPlayInterval = setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, 2000); // Change slide every 2 seconds
            }

            /**
             * Resets the autoplay timer. Called on manual navigation.
             */
            function resetAutoPlay() {
                clearInterval(autoPlayInterval);
                startAutoPlay();
            }

            // --- Event Listeners ---

            // Listen for mouse wheel scroll on the container
            sliderContainer.addEventListener('wheel', (event) => {
                event.preventDefault(); // Prevent page from scrolling
                if (isScrolling) return;

                if (event.deltaY > 0) {
                    // Scrolling down
                    goToSlide(currentIndex + 1);
                } else {
                    // Scrolling up
                    goToSlide(currentIndex - 1);
                }
                resetAutoPlay();
            });
            
            // --- Initialization ---
            createDots();
            goToSlide(0); // Initialize slider at the first slide
            startAutoPlay();
        });