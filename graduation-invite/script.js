// Graduation Invitation Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Graduation Invitation Loaded');
    
    // Initialize components
    initializeBook();
    initializeCountdown();
    initializeMusicPlayer();
    initializeWishForm();
    initializeFireworks();
    initializeShareButtons();
    initializeParticleEffects(); // New particle effects
    
    // Add welcome animation
    setTimeout(() => {
        showWelcomeAnimation();
    }, 500);

    try {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.play().catch(() => {
                showNotification('Nhấn vào trang để phát nhạc!');
                // Nếu bị chặn, phát lại khi user click bất kỳ đâu
                const tryPlay = () => {
                    bgMusic.play();
                    document.removeEventListener('click', tryPlay);
                };
                document.addEventListener('click', tryPlay);
            });
        }
    } catch (e) {}
});

// Book initialization with Turn.js
function initializeBook() {
    try {
        const $book = $('#book');
        
        // Check if Turn.js is loaded
        if (typeof $book.turn !== 'function') {
            console.warn('Turn.js not loaded, using fallback navigation');
            initializeFallbackNavigation();
            return;
        }
        
        // Hàm khởi tạo book với chế độ phù hợp
        function setupBookDisplay() {
            if ($book.data('turn')) $book.turn('destroy');
            const isMobile = window.innerWidth < 768;
            $book.turn({
                width: isMobile ? 370 : 800,
                height: isMobile ? 600 : 650,
                autoCenter: true,
                duration: 1000,
                display: isMobile ? 'single' : 'double',
                page: isMobile ? 1 : 3, // mobile vào trang 1, desktop vào trang 3
                acceleration: true,
                gradients: true,
                elevation: 50,
                when: {
                    turning: function(event, page, view) {
                        // Chặn không cho lật từ trang 2 về trang 1
                        if (view && view[0] === 3 && page === 2) {
                            event.preventDefault();
                            return;
                        }
                        console.log('Turning to page', page);
                        updateNavigationButtons(page);
                        
                        // Play page turn sound
                        playPageTurnSound();
                        
                        // Add page turn animation
                        addPageTurnEffect();
                    },
                    turned: function(event, page, view) {
                        console.log('Turned to page', page);
                        
                        // Check if we're on the countdown page
                        if (page === 11) { // Adjust based on your page count
                            updateCountdown();
                        }
                        
                        // Add special effects for cover page
                        if (page === 2) {
                            addCoverPageEffects();
                        }
                    }
                }
            });
        }
        setupBookDisplay();
        window.addEventListener('resize', function() {
            setupBookDisplay();
        });
        
        // Navigation buttons
        $('#next-btn').on('click', function() {
            $book.turn('next');
        });
        
        $('#prev-btn').on('click', function() {
            $book.turn('previous');
        });
        
        // Flip button functionality
        $('#flip-button').on('click', function() {
            $book.turn('next');
            $(this).addClass('loading');
            setTimeout(() => {
                $(this).removeClass('loading');
            }, 1000);
        });
        
        // Initial navigation state
        updateNavigationButtons(1);
        
        // Add initial cover page effects
        setTimeout(() => {
            addCoverPageEffects();
        }, 1000);

        // Thêm chức năng click vào vùng trái/phải để lật trang
        const bookElement = document.getElementById('book');
        if (bookElement) {
          bookElement.addEventListener('click', function(e) {
            const rect = bookElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const currentPage = $book.turn('page');
            // Nếu click vào 1/3 bên trái
            if (x < width / 3) {
              // Nếu đang ở trang 2 thì không lật về trang 1
              if (currentPage === 2) return;
              $book.turn('previous');
            } else if (x > width * 2 / 3) {
              $book.turn('next');
            }
          });
        }
        
    } catch (error) {
        console.error('Error initializing book:', error);
        initializeFallbackNavigation();
    }
}

// Fallback navigation for when Turn.js fails
function initializeFallbackNavigation() {
    const pages = document.querySelectorAll('.page');
    let currentPage = 0;
    
    // Hide all pages except first
    pages.forEach((page, index) => {
        if (index > 1) { // Show first two pages (cover)
            page.style.display = 'none';
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        if (currentPage < pages.length - 2) {
            pages[currentPage].style.display = 'none';
            pages[currentPage + 1].style.display = 'none';
            currentPage += 2;
            pages[currentPage].style.display = 'block';
            pages[currentPage + 1].style.display = 'block';
            updateNavigationButtons(currentPage + 1);
        }
    });
    
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (currentPage > 0) {
            pages[currentPage].style.display = 'none';
            pages[currentPage + 1].style.display = 'none';
            currentPage -= 2;
            pages[currentPage].style.display = 'block';
            pages[currentPage + 1].style.display = 'block';
            updateNavigationButtons(currentPage + 1);
        }
    });
}

// Update navigation buttons state
function updateNavigationButtons(page) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const totalPages = document.querySelectorAll('.page').length;
    
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages - 1;
}

// Countdown to graduation
function initializeCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const graduationDate = new Date('2025-07-10T09:30:00');
    
    function updateCountdown() {
        const now = new Date();
        const timeLeft = graduationDate - now;
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            countdownElement.textContent = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
        } else {
            countdownElement.textContent = 'Hôm nay là ngày tốt nghiệp!';
            launchCelebration();
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Music player
function initializeMusicPlayer() {
    const musicButton = document.getElementById('toggle-music');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    if (!musicButton || !bgMusic) return;

    // Đặt trạng thái ban đầu là tắt
    bgMusic.pause();
    musicButton.textContent = 'Bật nhạc';
    musicButton.classList.remove('playing');
    isPlaying = false;

    // Tự động phát nhạc khi vào trang (nếu được phép)
    setTimeout(() => {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicButton.textContent = 'Tắt nhạc';
            musicButton.classList.add('playing');
        }).catch(() => {
            // Nếu bị chặn, phát khi user click đầu tiên
            const tryPlay = () => {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicButton.textContent = 'Tắt nhạc';
                    musicButton.classList.add('playing');
                });
                document.removeEventListener('click', tryPlay);
            };
            document.addEventListener('click', tryPlay);
        });
    }, 500);

    musicButton.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            musicButton.textContent = 'Bật nhạc';
            musicButton.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => {
                console.log('Auto-play prevented:', e);
                showNotification('Vui lòng tương tác với trang để phát nhạc');
            });
            musicButton.textContent = 'Tắt nhạc';
            musicButton.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // Handle music events
    bgMusic.addEventListener('ended', function() {
        isPlaying = false;
        musicButton.textContent = 'Bật nhạc';
        musicButton.classList.remove('playing');
    });
}

// Tối ưu hiệu ứng particles cho mobile: giảm số lượng và duration
function createCoverParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    // Xóa particles cũ nếu có
    particlesContainer.innerHTML = '';
    // Giảm số lượng particles nếu là mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 8 : 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'star-particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 215, 0, 0.7);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.8 + 0.2};
            animation: twinkle ${isMobile ? (Math.random() * 2 + 1) : (Math.random() * 3 + 2)}s infinite ease-in-out;
        `;
        particlesContainer.appendChild(particle);
    }
    // Add CSS for twinkling animation (chỉ thêm 1 lần)
    if (!document.getElementById('twinkle-style')) {
        const style = document.createElement('style');
        style.id = 'twinkle-style';
        style.innerHTML = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add special effects for cover page
function addCoverPageEffects() {
    // Add floating icons effect to cover page
    const coverPage = document.querySelector('.cover-back');
    if (!coverPage) return;
    
    // Add subtle glow effect to graduation cap
    const gradCap = coverPage.querySelector('svg');
    if (gradCap) {
        gradCap.style.filter = 'drop-shadow(0 0 8px rgba(200, 165, 74, 0.6))';
    }
    
    // Add subtle animation to icons
    const icons = coverPage.querySelectorAll('.fas');
    icons.forEach(icon => {
        const randomDelay = Math.random() * 2;
        icon.style.animation = `float ${3 + randomDelay}s ease-in-out infinite`;
        icon.style.animationDelay = `${randomDelay}s`;
    });
}

// Wish form functionality
function initializeWishForm() {
    const wishForm = document.getElementById('wish-form');
    const wishList = document.getElementById('wish-list');
    if (!wishForm || !wishList) return;

    // Load wishes từ Firebase
    db.ref('wishes').on('value', (snapshot) => {
        wishList.innerHTML = '';
        const wishes = [];
        snapshot.forEach(child => wishes.push(child.val()));
        wishes.reverse().forEach(addWish); // Hiển thị mới nhất lên đầu
        updateFloatingWishQueue(wishes); // Cập nhật queue cho floating wish
        // Hiển thị luôn 5 wish mới nhất (nếu chưa đủ 5)
        if (floatingWishActive.length < 5) {
            const toShow = floatingWishQueue.filter(w => !floatingWishActive.find(a => a.id === w.id)).slice(0, 5 - floatingWishActive.length);
            toShow.forEach(displayFloatingWish);
        }
    });

    wishForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameInput = document.getElementById('wish-name');
        const messageInput = document.getElementById('wish-message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        if (name && message) {
            const wish = {
                name: name,
                message: message,
                timestamp: new Date().toISOString()
            };
            // Lưu lên Firebase
            db.ref('wishes').push(wish);
            // Clear form
            nameInput.value = '';
            messageInput.value = '';
            // Show floating wish (ưu tiên hiển thị ngay)
            showFloatingWish(wish);
            // Show notification
            showNotification('Cảm ơn bạn đã gửi lời chúc!');
        }
    });
}

// Add wish to display
function addWish(wish) {
    const wishList = document.getElementById('wish-list');
    const wishItem = document.createElement('div');
    wishItem.className = 'wish-item';
    wishItem.innerHTML = `
        <strong>${escapeHtml(wish.name)}</strong>
        <p>${escapeHtml(wish.message)}</p>
        <small class="text-gray-500">${formatDate(wish.timestamp)}</small>
    `;
    
    wishList.insertBefore(wishItem, wishList.firstChild);
    
    // Apply animation
    wishItem.style.opacity = '0';
    wishItem.style.transform = 'translateY(20px)';
    wishItem.style.transition = 'all 0.5s ease';
    
  setTimeout(() => {
        wishItem.style.opacity = '1';
        wishItem.style.transform = 'none';
    }, 10);
}

// Save wish to localStorage
function saveWish(wish) {
    const wishes = JSON.parse(localStorage.getItem('graduationWishes') || '[]');
    wishes.unshift(wish);
    
    // Keep only last 50 wishes
    if (wishes.length > 50) {
        wishes.splice(50);
    }
    
    localStorage.setItem('graduationWishes', JSON.stringify(wishes));
}

// Load wishes from localStorage
function loadWishes() {
    const wishes = JSON.parse(localStorage.getItem('graduationWishes') || '[]');
    wishes.forEach(wish => addWish(wish));
}

// Fireworks animation
function initializeFireworks() {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return;
    
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
    
    const fireworks = [];
    const particles = [];
    
  function createFirework() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        return {
            x: Math.random() * canvas.width,
            y: canvas.height,
            targetY: Math.random() * canvas.height * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: -Math.random() * 10 - 5,
            exploded: false
        };
    }
    
    function createParticle(x, y, color) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: color,
            life: 1,
            decay: Math.random() * 0.02 + 0.015
        };
    }
    
    function updateFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            fw.y += fw.velocity;
            
            if (fw.y <= fw.targetY && !fw.exploded) {
                fw.exploded = true;
                // Create particles
                for (let j = 0; j < 20; j++) {
                    particles.push(createParticle(fw.x, fw.y, fw.color));
                }
                fireworks.splice(i, 1);
            }
            
            // Draw firework
      ctx.beginPath();
            ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = fw.color;
      ctx.fill();
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        requestAnimationFrame(updateFireworks);
  }
    
    // Start fireworks occasionally
    setInterval(() => {
        if (Math.random() < 0.3) {
            fireworks.push(createFirework());
        }
    }, 1000);
    
    updateFireworks();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
});
}

// Share buttons
function initializeShareButtons() {
    const facebookBtn = document.getElementById('share-facebook');
    const zaloBtn = document.getElementById('share-zalo');
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Mời bạn đến dự lễ tốt nghiệp của tôi!');
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
        });
    }
    
    if (zaloBtn) {
        zaloBtn.addEventListener('click', function() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Mời bạn đến dự lễ tốt nghiệp của tôi!');
            window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
});
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Quản lý queue các wish để floating wish lặp lại ngẫu nhiên
window.floatingWishQueue = window.floatingWishQueue || [];
window.floatingWishActive = window.floatingWishActive || [];
const floatingWishQueue = window.floatingWishQueue;
let floatingWishActive = window.floatingWishActive;

// Hàm cập nhật queue lời chúc từ Firebase (ưu tiên mới nhất, không trùng lặp)
function updateFloatingWishQueue(wishes) {
    // Xóa queue cũ
    floatingWishQueue.length = 0;
    // Thêm mới nhất lên đầu, loại trùng lặp (theo name+message)
    const seen = new Set();
    wishes.forEach(wish => {
        const key = wish.name + '|' + wish.message;
        if (!seen.has(key)) {
            floatingWishQueue.push({
                id: wish.timestamp + Math.random(),
                name: wish.name,
                message: wish.message,
                timestamp: wish.timestamp
            });
            seen.add(key);
        }
    });
}

// Sửa lại initializeWishForm để cập nhật floatingWishQueue và hiển thị 5 wish mới nhất
function initializeWishForm() {
    const wishForm = document.getElementById('wish-form');
    const wishList = document.getElementById('wish-list');
    if (!wishForm || !wishList) return;

    // Load wishes từ Firebase
    db.ref('wishes').on('value', (snapshot) => {
        wishList.innerHTML = '';
        const wishes = [];
        snapshot.forEach(child => wishes.push(child.val()));
        wishes.reverse().forEach(addWish); // Hiển thị mới nhất lên đầu
        updateFloatingWishQueue(wishes); // Cập nhật queue cho floating wish
        // Hiển thị luôn 5 wish mới nhất (nếu chưa đủ 5)
        if (floatingWishActive.length < 5) {
            const toShow = floatingWishQueue.filter(w => !floatingWishActive.find(a => a.id === w.id)).slice(0, 5 - floatingWishActive.length);
            toShow.forEach(displayFloatingWish);
        }
    });

    wishForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameInput = document.getElementById('wish-name');
        const messageInput = document.getElementById('wish-message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        if (name && message) {
            const wish = {
                name: name,
                message: message,
                timestamp: new Date().toISOString()
            };
            // Lưu lên Firebase
            db.ref('wishes').push(wish);
            // Clear form
            nameInput.value = '';
            messageInput.value = '';
            // Show floating wish (ưu tiên hiển thị ngay)
            showFloatingWish(wish);
            // Show notification
            showNotification('Cảm ơn bạn đã gửi lời chúc!');
        }
    });
}

// Helper: kiểm tra mobile
function isMobileDevice() {
    return window.innerWidth < 768;
}

// Sửa lại các hàm floating wish để không hiển thị trên mobile
function showFloatingWish(wish) {
    if (isMobileDevice()) return; // Không hiển thị trên mobile
    const floatingWishes = document.getElementById('floating-wishes');
    if (!floatingWishes) return;
    floatingWishQueue.unshift({
        id: wish.timestamp + Math.random(),
        name: wish.name,
        message: wish.message,
        timestamp: wish.timestamp
    });
    while (floatingWishes.childElementCount >= 5) {
        floatingWishes.removeChild(floatingWishes.firstChild);
        floatingWishActive.shift();
    }
    displayFloatingWish(floatingWishQueue[0]);
}

function displayFloatingWish(wishObj) {
    if (isMobileDevice()) return; // Không hiển thị trên mobile
    const floatingWishes = document.getElementById('floating-wishes');
    if (!floatingWishes) return;
    if (floatingWishes.childElementCount >= 5) return;
    if (floatingWishActive.find(w => w.id === wishObj.id)) return;
    const wishDiv = document.createElement('div');
    wishDiv.className = 'floating-wish';
    wishDiv.innerHTML = `<strong>${escapeHtml(wishObj.name)}</strong><br><span>${escapeHtml(wishObj.message)}</span>`;

    // Lấy vị trí và kích thước của #book
    const book = document.getElementById('book');
    let bookRect = null;
    if (book) {
        bookRect = book.getBoundingClientRect();
    }

    // Random vị trí ngoài vùng #book
    let maxTry = 20;
    let top, left;
    do {
        top = Math.random() * 60 + 10; // vh
        left = Math.random() * 60 + 10; // vw
        const wishWidth = 220;
        const wishHeight = 60;
        const pxTop = window.innerHeight * (top / 100);
        const pxLeft = window.innerWidth * (left / 100);
        if (bookRect) {
            const overlap = !(
                pxLeft + wishWidth < bookRect.left ||
                pxLeft > bookRect.right ||
                pxTop + wishHeight < bookRect.top ||
                pxTop > bookRect.bottom
            );
            if (!overlap) break;
        } else {
            break;
        }
        maxTry--;
    } while (maxTry > 0);

    wishDiv.style.top = top + 'vh';
    wishDiv.style.left = left + 'vw';

    // Thêm chức năng kéo thả
    makeWishDraggable(wishDiv);

    floatingWishes.appendChild(wishDiv);
    floatingWishActive.push(wishObj);

    // Sau 30s, ẩn wish và lặp lại random wish khác
    setTimeout(() => {
        wishDiv.classList.add('hide');
        setTimeout(() => {
            if (wishDiv.parentNode) wishDiv.parentNode.removeChild(wishDiv);
            // Xóa khỏi active
            floatingWishActive = floatingWishActive.filter(w => w.id !== wishObj.id);
            // Lặp lại random wish khác nếu còn trong queue
            repeatRandomFloatingWish();
        }, 1000);
    }, 30000);
}

// Hàm kéo thả cho floating wish
function makeWishDraggable(wishDiv) {
    let isDragging = false;
    let startX, startY, origX, origY;

    // Mouse events
    wishDiv.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origX = parseInt(wishDiv.style.left) || wishDiv.offsetLeft;
        origY = parseInt(wishDiv.style.top) || wishDiv.offsetTop;
        wishDiv.style.transition = 'none';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e) {
        if (!isDragging) return;
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        let newLeft = origX + dx;
        let newTop = origY + dy;
        wishDiv.style.left = newLeft + 'px';
        wishDiv.style.top = newTop + 'px';
    }
    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            wishDiv.style.transition = '';
            document.body.style.userSelect = '';
        }
    }

    // Touch events
    wishDiv.addEventListener('touchstart', function(e) {
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        origX = parseInt(wishDiv.style.left) || wishDiv.offsetLeft;
        origY = parseInt(wishDiv.style.top) || wishDiv.offsetTop;
        wishDiv.style.transition = 'none';
    });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    function onTouchMove(e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        let dx = touch.clientX - startX;
        let dy = touch.clientY - startY;
        let newLeft = origX + dx;
        let newTop = origY + dy;
        wishDiv.style.left = newLeft + 'px';
        wishDiv.style.top = newTop + 'px';
        e.preventDefault();
    }
    function onTouchEnd() {
        if (isDragging) {
            isDragging = false;
            wishDiv.style.transition = '';
        }
    }
}

function repeatRandomFloatingWish() {
    if (isMobileDevice()) return; // Không hiển thị trên mobile
    // Nếu đang đủ 5 wish active, không lặp lại
    if (floatingWishActive.length >= 5) return;
    // Lấy các wish chưa active
    const available = floatingWishQueue.filter(w => !floatingWishActive.find(a => a.id === w.id));
    if (available.length === 0) return;
    // Random 1 wish để hiển thị lại
    const randomWish = available[Math.floor(Math.random() * available.length)];
    displayFloatingWish(randomWish);
}

function showWelcomeAnimation() {
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.style.opacity = '0';
        page.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            page.style.transition = 'all 0.8s ease';
            page.style.opacity = '1';
            page.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function launchCelebration() {
    // Launch multiple fireworks
    const canvas = document.getElementById('fireworks');
    if (canvas) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const firework = createFirework();
                fireworks.push(firework);
    }, i * 200);
  }
    }
    
    // Show celebration message
    showNotification('🎉 Chúc mừng ngày tốt nghiệp! 🎉');
}

function playPageTurnSound() {
    // Create a simple page turn sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function addPageTurnEffect() {
    const book = document.getElementById('book');
    if (book) {
        book.classList.add('turning');
  setTimeout(() => {
            book.classList.remove('turning');
  }, 1000);
    }
}

// Add CSS class for turning effect
const style = document.createElement('style');
style.textContent = `
    .turning {
        animation: bookTurn 1s ease-in-out;
}

    @keyframes bookTurn {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(-5deg); }
        100% { transform: rotateY(0deg); }
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Script error:', e.error);
});

// Service worker registration (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(error) {
        console.log('Service Worker registration failed:', error);
    });
}

// Thêm vào đầu file script.js
const firebaseConfig = {
  databaseURL: "https://totnghiep-115a8-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
