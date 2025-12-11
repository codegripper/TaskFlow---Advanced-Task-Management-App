/**
 * Mobile Enhancement Script
 * Adds mobile-specific features and touch interactions
 */

(function() {
    'use strict';

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || isTouch) {
        document.body.classList.add('mobile-device');
    }

    // Prevent double-tap zoom on buttons
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        // Force recalculation of viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Reload chart if visible
        setTimeout(() => {
            if (typeof app !== 'undefined' && app.chart) {
                app.chart.resize();
            }
        }, 300);
    });

    // Set initial viewport height
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);

    // Add pull-to-refresh functionality
    let startY = 0;
    let isPulling = false;
    const pullThreshold = 80;

    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
            isPulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        const currentY = e.touches[0].pageY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0 && window.scrollY === 0) {
            // Show pull indicator
            if (pullDistance > pullThreshold) {
                // Visual feedback
                document.body.style.opacity = '0.9';
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        if (!isPulling) return;
        
        const endY = e.changedTouches[0].pageY;
        const pullDistance = endY - startY;
        
        if (pullDistance > pullThreshold && window.scrollY === 0) {
            // Trigger refresh
            if (typeof app !== 'undefined') {
                app.syncWithServer();
            }
            location.reload();
        }
        
        document.body.style.opacity = '1';
        isPulling = false;
    });

    // Swipe gesture support for modals
    function addSwipeToClose(modalElement) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const modalContent = modalElement.querySelector('.modal-content');
        if (!modalContent) return;

        modalContent.addEventListener('touchstart', function(e) {
            startY = e.touches[0].pageY;
            isDragging = true;
        }, { passive: true });

        modalContent.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentY = e.touches[0].pageY;
            const diff = currentY - startY;
            
            // Only allow downward swipes
            if (diff > 0) {
                modalContent.style.transform = `translateY(${diff}px)`;
                modalContent.style.transition = 'none';
            }
        }, { passive: true });

        modalContent.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            const diff = currentY - startY;
            
            // Close modal if swiped down more than 100px
            if (diff > 100) {
                modalElement.classList.add('hidden');
            }
            
            // Reset position
            modalContent.style.transform = '';
            modalContent.style.transition = '';
            isDragging = false;
        });
    }

    // Initialize swipe-to-close for all modals
    document.addEventListener('DOMContentLoaded', function() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => addSwipeToClose(modal));
    });

    // Haptic feedback for button taps (if supported)
    function triggerHaptic(intensity = 'medium') {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30
            };
            navigator.vibrate(patterns[intensity] || 20);
        }
    }

    // Add haptic feedback to buttons
    document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('touchstart', function(e) {
            if (e.target.matches('.btn, .filter-btn, .btn-icon, .task-checkbox input')) {
                triggerHaptic('light');
            }
        }, { passive: true });
    });

    // Handle keyboard visibility on mobile
    if (isMobile) {
        let originalHeight = window.innerHeight;

        window.addEventListener('resize', function() {
            const currentHeight = window.innerHeight;
            const heightDiff = originalHeight - currentHeight;

            // Keyboard is likely open if height decreased significantly
            if (heightDiff > 150) {
                document.body.classList.add('keyboard-open');
                
                // Scroll to focused input
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    setTimeout(() => {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
    }

    // Smart scroll behavior for forms
    document.addEventListener('focusin', function(e) {
        if (e.target.matches('input, textarea, select')) {
            // Add small delay for mobile keyboard
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        }
    });

    // Optimize tab navigation scrolling
    document.addEventListener('DOMContentLoaded', function() {
        const tabNav = document.querySelector('.ef-tabs nav ul');
        if (!tabNav) return;

        // Scroll active tab into view
        const activeTab = tabNav.querySelector('li.tab-current');
        if (activeTab && isMobile) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Add touch-friendly active states
        tabNav.addEventListener('touchstart', function(e) {
            if (e.target.closest('li')) {
                e.target.closest('li').classList.add('touching');
            }
        }, { passive: true });

        tabNav.addEventListener('touchend', function(e) {
            const li = e.target.closest('li');
            if (li) {
                li.classList.remove('touching');
                // Scroll the clicked tab into center view
                setTimeout(() => {
                    li.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }, 100);
            }
        });
    });

    // Handle safe area insets for iOS
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
        document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
    }

    // Prevent iOS bounce on body scroll
    if (/(iPhone|iPod|iPad)/i.test(navigator.platform)) {
        document.addEventListener('touchmove', function(e) {
            if (e.target === document.body || e.target === document.documentElement) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Add fast-click class for better touch response
    document.addEventListener('DOMContentLoaded', function() {
        if (isTouch) {
            // Remove 300ms click delay on mobile
            document.body.style.touchAction = 'manipulation';
        }
    });

    // Handle network status changes
    window.addEventListener('online', function() {
        if (typeof app !== 'undefined') {
            app.showNotification('Back online! Syncing data...', 'success');
            app.syncWithServer();
        }
    });

    window.addEventListener('offline', function() {
        if (typeof app !== 'undefined') {
            app.showNotification('You are offline. Changes will sync when reconnected.', 'warning');
        }
    });

    // Add install prompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button or banner
        const installBtn = document.createElement('div');
        installBtn.className = 'install-prompt';
        installBtn.innerHTML = `
            <div class="install-prompt-content">
                <i class="fa fa-download"></i>
                <span>Install TaskFlow for easier access</span>
                <button class="btn btn-small" id="installAppBtn">Install</button>
                <button class="close-install" aria-label="Close">&times;</button>
            </div>
        `;
        document.body.appendChild(installBtn);

        // Handle install
        document.getElementById('installAppBtn').addEventListener('click', function() {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            });
        });

        // Handle close
        document.querySelector('.close-install').addEventListener('click', function() {
            installBtn.remove();
        });
    });

    // Log when app is installed
    window.addEventListener('appinstalled', function() {
        console.log('TaskFlow was installed');
        if (typeof app !== 'undefined') {
            app.showNotification('TaskFlow installed successfully!', 'success');
        }
    });

    // Handle share functionality if available
    if (navigator.share && isMobile) {
        const addShareButtons = () => {
            // Add share button to appropriate places
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-small share-btn';
            shareBtn.innerHTML = '<i class="fa fa-share"></i> Share';
            shareBtn.addEventListener('click', async function() {
                try {
                    await navigator.share({
                        title: 'TaskFlow',
                        text: 'Check out TaskFlow - Advanced task management app',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Share failed:', err);
                }
            });
        };
    }

    console.log('Mobile enhancements loaded');
})();
