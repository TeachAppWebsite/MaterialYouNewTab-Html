/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

document.addEventListener("DOMContentLoaded", function () {
    // Constants
    const MAX_SHORTCUTS = 50;
    const PLACEHOLDER = {
        name: "新快捷方式",
        url: "https://dy.ci/",
        inputName: "名称",
        inputUrl: "地址"
    };

    // DOM Elements
    const dom = {
        shortcuts: document.getElementById("shortcuts-section"),
        shortcutsCheckbox: document.getElementById("shortcutsCheckbox"),
        shortcutEditField: document.getElementById("shortcutEditField"),
        adaptiveIconField: document.getElementById("adaptiveIconField"),
        adaptiveIconToggle: document.getElementById("adaptiveIconToggle"),
        shortcutSettingsContainer: document.getElementById("shortcutList"),
        shortcutsContainer: document.getElementById("shortcutsContainer"),
        newShortcutButton: document.getElementById("newShortcutButton"),
        resetShortcutsButton: document.getElementById("resetButton"),
    };

    // Preset Data
    const presets = [
        {
            name: "dy.ci",
            url: "dy.ci",
            domains: ["dy.ci"],
            svg: `<img src="https://drive.dy.ci/d/%E6%95%99%E8%BE%85%E8%BD%AF%E4%BB%B6/%E5%9B%BE%E5%BA%8A/a4sl7-lh1v6.svg?sign=yKvTTEuMxarLcVJ3lb5igcRSw5MIk43TGHDUhSYVyAQ=:0" alt="dy.ci">`
        },
        {
            name: "ddc",
            url: "drive.dy.ci",
            domains: ["drive.dy.ci"],
            svg: `<img src="https://drive.dy.ci/d/%E6%95%99%E8%BE%85%E8%BD%AF%E4%BB%B6/%E5%9B%BE%E5%BA%8A/apoqo-5jyzi.svg?sign=xltdg-Meq4d8pivyhcA2lGSobIP8ob_GQq1cil1o9KY=:0" alt="ddc">`
        },
        {
            name: "Classworks",
            url: "cs.houlang.cloud",
            domains: ["cs.houlang.cloud"],
            svg: `<img src="https://drive.dy.ci/d/%E6%95%99%E8%BE%85%E8%BD%AF%E4%BB%B6/%E5%9B%BE%E5%BA%8A/%E7%94%BB%E6%9D%BF%2025%20(4).svg?sign=OVVbMDdjN_avcEQ7DVCdfwqePqsvoXco2gYC041jVQE=:0" alt="Classworks">`
        }
    ];

    // Cache for shortcuts data
    let shortcutsCache = [];

    // Initialization
    loadSettings();
    setupEventListeners();
    loadShortcuts();

    // Loads all settings from localStorage and applies them
    function loadSettings() {
        loadCheckboxState("shortcutsCheckboxState", dom.shortcutsCheckbox);
        loadCheckboxState("adaptiveIconToggle", dom.adaptiveIconToggle);
        loadActiveStatus("shortcutEditField", dom.shortcutEditField);
        loadActiveStatus("adaptiveIconField", dom.adaptiveIconField);
        loadDisplayStatus("shortcutsDisplayStatus", dom.shortcuts);

        // 首次打开默认启用快捷方式
        if (localStorage.getItem("shortcutsDisplayStatus") === null) {
            dom.shortcuts.style.display = "flex";
            dom.shortcutsCheckbox.checked = true;
            saveDisplayStatus("shortcutsDisplayStatus", "flex");
            saveCheckboxState("shortcutsCheckboxState", dom.shortcutsCheckbox);
        }

        // Apply adaptive icon style if enabled
        if (dom.adaptiveIconToggle.checked) {
            dom.shortcutsContainer.classList.add("adaptive-icons");
        } else {
            dom.shortcutsContainer.classList.remove("adaptive-icons");
        }
    }

    // Sets up all event listeners
    function setupEventListeners() {
        // Checkbox events
        dom.shortcutsCheckbox.addEventListener("change", handleShortcutsToggle);
        dom.adaptiveIconToggle.addEventListener("change", handleAdaptiveIconToggle);

        // Button events
        dom.newShortcutButton.addEventListener("click", handleNewShortcutClick);
        dom.resetShortcutsButton.addEventListener("click", resetShortcuts);
    }

    // Handles the new shortcut button click with animation and focus
    let focusTimeoutId;
    function handleNewShortcutClick() {
        if (this.classList.contains("inactive")) return;

        const currentAmount = parseInt(localStorage.getItem("shortcutAmount")) || shortcutsCache.length;
        if (currentAmount >= MAX_SHORTCUTS) return;

        addNewShortcut();

        // Scroll to the new shortcut and focus on the URL input
        const allEntries = document.querySelectorAll(".shortcutSettingsEntry");
        const lastEntry = allEntries[allEntries.length - 1];
        const urlInput = lastEntry.querySelector("input.URL");

        urlInput.scrollIntoView({ behavior: "smooth", block: "center" });

        clearTimeout(focusTimeoutId);
        const modalContainer = document.getElementById("prompt-modal-container");
        focusTimeoutId = setTimeout(() => {
            if (modalContainer?.style.display !== "flex")
                urlInput.focus();
        }, 800);
    }

    // Loads shortcuts from localStorage or uses presets if none exist
    function loadShortcuts() {
        const amount = localStorage.getItem("shortcutAmount") || presets.length;
        const deleteInactive = amount <= 1;

        shortcutsCache = [];

        for (let i = 0; i < amount; i++) {
            const name = localStorage.getItem(`shortcutName${i}`) || (presets[i] ? presets[i].name : PLACEHOLDER.name);
            const url = localStorage.getItem(`shortcutURL${i}`) || (presets[i] ? presets[i].url : PLACEHOLDER.url);

            shortcutsCache.push({ name, url });

            const entry = createShortcutEntry(name, url, deleteInactive, i);
            dom.shortcutSettingsContainer.appendChild(entry);
            renderShortcut(name, url, i);
        }

        // Disable new shortcut button if max reached
        if (amount >= MAX_SHORTCUTS) {
            dom.newShortcutButton.classList.add("inactive");
        }

        setupDragAndDrop();
    }

    // Creates a shortcut entry element for the settings panel
    function createShortcutEntry(name, url, deleteInactive, index) {
        const entry = document.createElement("div");
        entry.className = "shortcutSettingsEntry";
        entry.draggable = true;
        entry._index = index;

        entry.innerHTML = `
            <div class="grip-container" draggable="true">
                <svg stroke="currentColor" width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                    <circle cy="2.5" cx="5.5" r=".75"/>
                    <circle cy="8" cx="5.5" r=".75"/>
                    <circle cy="13.5" cx="5.5" r=".75"/>
                    <circle cy="2.5" cx="10.5" r=".75"/>
                    <circle cy="8" cx="10.5" r=".75"/>
                    <circle cy="13.5" cx="10.5" r=".75"/>
                </svg>
            </div>
            <div>
                <input class="shortcutName" placeholder="${PLACEHOLDER.inputName}" value="${escapeHtml(name)}">
                <input class="URL" placeholder="${PLACEHOLDER.inputUrl}" value="${escapeHtml(url)}">
            </div>
            <div class="delete">
                <button class="${deleteInactive ? 'inactive' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M7.8 20.4q-.742 0-1.271-.529Q6 19.343 6 18.6v-12h-.3q-.383 0-.641-.257-.259-.258-.259-.638t.259-.643Q5.317 4.8 5.7 4.8h3.9v-.3q0-.383.259-.641.258-.259.641-.259h3q.383 0 .641.259.259.258.259.641v.3h3.9q.383 0 .641.257.259.257.259.638 0 .38-.259.643-.258.262-.641.262H18v11.99q0 .76-.529 1.285-.529.525-1.271.525Zm8.4-13.8H7.8v12h8.4zm-5.705 10.2q.38 0 .643-.259.262-.259.262-.641V9.3q0-.383-.257-.641-.258-.259-.638-.259t-.643.259Q9.6 8.917 9.6 9.3v6.6q0 .383.257.641.258.259.638.259Zm3 0q.38 0 .643-.259.262-.259.262-.641V9.3q0-.383-.257-.641-.258-.259-.638-.259t-.643.259q-.262.258-.262.641v6.6q0 .383.257.641.258.259.638.259ZM7.8 6.6v12z"/>
                    </svg>
                </button>
            </div>
        `;

        const inputs = entry.querySelectorAll("input");
        attachInputListeners(inputs, entry);

        const deleteBtn = entry.querySelector(".delete button");
        deleteBtn.addEventListener("click", () => deleteShortcut(entry));

        return entry;
    }

    // Renders a shortcut in the main view
    function renderShortcut(name, url, index) {
        const normalizedUrl = normalizeUrl(url);
        const shortcut = document.createElement("div");
        shortcut.className = "shortcuts";
        shortcut._index = index;

        shortcut.innerHTML = `
            <a href="${normalizedUrl}">
                <div class="shortcutLogoContainer">
                    ${getLogoHtml(normalizedUrl)}
                </div>
                <span class="shortcut-name">${escapeHtml(name)}</span>
            </a>
        `;

        if (index < dom.shortcutsContainer.children.length) {
            dom.shortcutsContainer.replaceChild(shortcut, dom.shortcutsContainer.children[index]);
        } else {
            dom.shortcutsContainer.appendChild(shortcut);
        }
    }

    // Escapes HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match]));
    }

    // Normalizes URLs to ensure they're valid
    function normalizeUrl(url) {
        url = url.trim();
        return encodeURI(
            url.startsWith("https://") || url.startsWith("http://") ? url : `https://${url}`
        );
    }

    // Gets the appropriate logo HTML for a given URL
    function getLogoHtml(url) {
        const hostname = new URL(normalizeUrl(url)).hostname.replace("www.", "");

        if (hostname === "github.com") {
            return `<img src="./svgs/github-shortcut.svg" alt="">`;
        }

        // Check presets for matching domain
        const preset = presets.find(p => p.domains.includes(hostname));
        if (preset) {
            return preset.svg;
        }

        // Fetch favicon from Google 
        return `<img src="https://s2.googleusercontent.com/s2/favicons?domain_url=https://${hostname}&sz=256" 
                onerror="this.src='./svgs/offline.svg'" alt="">`;
    }

    // Attaches event listeners to shortcut input fields
    function attachInputListeners(inputs, entry) {
        inputs.forEach(input => {
            input.addEventListener("blur", () => {
                saveShortcut(entry);
                renderShortcut(
                    entry.querySelector(".shortcutName").value,
                    entry.querySelector(".URL").value,
                    entry._index
                );
            });
            input.addEventListener("focus", e => e.target.select());
        });

        inputs[0].addEventListener("keydown", e => e.key === "Enter" && inputs[1].focus());
        inputs[1].addEventListener("keydown", e => e.key === "Enter" && e.target.blur());
    }

    // Drag and drop functionality for reordering shortcuts
    function setupDragAndDrop() {
        let draggedElement = null;
        let autoScrollInterval = null;
        let dragOffset = { x: 0, y: 0 };
        let isReordering = false;
        let pendingReorder = false;
        let isDragging = false;

        // Cache element positions for smooth gliding animation
        function cachePositions() {
            const map = new Map();
            const entries = dom.shortcutSettingsContainer.querySelectorAll('.shortcutSettingsEntry');
            for (const el of entries) {
                map.set(el, el.getBoundingClientRect().top);
            }
            return map;
        }

        // Animate smooth gliding effect for sibling elements
        function animateGlide(oldPositions) {
            const entries = [...dom.shortcutSettingsContainer.children];
            const newPositions = new Map();

            // Batch read
            entries.forEach(el => {
                if (el !== draggedElement) {
                    newPositions.set(el, el.getBoundingClientRect().top);
                }
            });

            // Batch write
            entries.forEach(el => {
                if (el === draggedElement) return;
                const oldTop = oldPositions.get(el);
                const newTop = newPositions.get(el);
                if (oldTop !== undefined && newTop !== undefined) {
                    const delta = oldTop - newTop;
                    if (delta !== 0) {
                        el.style.transition = 'none';
                        el.style.transform = `translateY(${delta}px)`;
                        requestAnimationFrame(() => {
                            el.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
                            el.style.transform = 'none';
                        });
                    }
                }
            });
        }

        // Auto-scroll functionality
        function handleAutoScroll(clientY) {
            const container = dom.shortcutSettingsContainer;
            const containerRect = container.getBoundingClientRect();
            const scrollThreshold = 50; // pixels from edge to trigger scroll
            const scrollSpeed = 5; // pixels per frame

            // Clear existing interval
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }

            // Check if we need to scroll up
            if (clientY - containerRect.top < scrollThreshold && container.scrollTop > 0) {
                autoScrollInterval = setInterval(() => {
                    container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
                }, 16); // ~60fps
            }
            // Check if we need to scroll down
            else if (containerRect.bottom - clientY < scrollThreshold &&
                container.scrollTop < container.scrollHeight - container.clientHeight) {
                autoScrollInterval = setInterval(() => {
                    const maxScroll = container.scrollHeight - container.clientHeight;
                    container.scrollTop = Math.min(maxScroll, container.scrollTop + scrollSpeed);
                }, 16); // ~60fps
            }
        }

        // Stop auto-scroll
        function stopAutoScroll() {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
        }

        // Helper function for drag and drop with cached rect
        let dragElementsCache = [];
        let cacheTimestamp = 0;

        function getSortedElements() {
            const now = Date.now();
            // Cache for 16ms (one frame) to avoid repeated getBoundingClientRect calls
            if (now - cacheTimestamp < 16) {
                return dragElementsCache;
            }

            dragElementsCache = [...dom.shortcutSettingsContainer.querySelectorAll(".shortcutSettingsEntry:not(.dragging)")]
                .map(el => ({
                    element: el,
                    rect: el.getBoundingClientRect()
                }));
            cacheTimestamp = now;
            return dragElementsCache;
        }

        function getDragAfterElement(y) {
            const elements = getSortedElements();
            let low = 0, high = elements.length - 1;

            while (low <= high) {
                const mid = (low + high) >>> 1;
                const middleY = elements[mid].rect.top + elements[mid].rect.height / 2;
                y < middleY ? high = mid - 1 : low = mid + 1;
            }

            return elements[low]?.element || null;
        }

        // Insert element with smooth animation
        function insertElementWithAnimation(element, targetElement, insertBefore = true) {
            const oldPositions = cachePositions();
            const container = dom.shortcutSettingsContainer;

            // Perform DOM insertion
            if (targetElement) {
                if (insertBefore) {
                    // Insert before target element
                    container.insertBefore(element, targetElement);
                } else {
                    // Insert after target element
                    container.insertBefore(element, targetElement.nextSibling);
                }
            } else {
                // Append to end if no target element
                container.appendChild(element);
            }

            animateGlide(oldPositions);
            pendingReorder = true;
        }

        // Common drag logic for both mouse and touch
        function handleDragMove(clientX, clientY) {
            if (!isReordering || !draggedElement) return;

            // Handle auto-scroll
            handleAutoScroll(clientY);

            const afterElement = getDragAfterElement(clientY);

            // Add null/undefined check
            if (afterElement === null || afterElement === undefined) {
                // Move to end
                insertElementWithAnimation(draggedElement, null, false);
                return;
            }

            // Check if we need to reorder
            if (afterElement && afterElement !== draggedElement) {
                // Only move if it's actually a different position
                if (afterElement.previousSibling !== draggedElement) {
                    insertElementWithAnimation(draggedElement, afterElement, true);
                }
            } else if (!afterElement) {
                // Move to end if no after element
                const lastElement = dom.shortcutSettingsContainer.lastElementChild;
                if (lastElement && lastElement !== draggedElement) {
                    insertElementWithAnimation(draggedElement, null, false);
                }
            }
        }

        // Common cleanup logic
        function cleanup() {
            stopAutoScroll();

            // Remove CSS classes
            if (draggedElement) {
                draggedElement.classList.remove("dragging");
            }

            // Only update if we actually made changes
            if (pendingReorder) {
                updateShortcutIndices();
                saveShortcutOrder();
                pendingReorder = false;
            }

            // Reset state
            dom.shortcutSettingsContainer.classList.remove("dragging-ongoing");
            isReordering = false;
            isDragging = false;
            draggedElement = null;
        }

        // ==== MOUSE EVENTS ====
        dom.shortcutSettingsContainer.addEventListener("dragstart", e => {
            const item = e.target.closest(".shortcutSettingsEntry");
            if (item) {
                isReordering = true;
                draggedElement = item;

                // Calculate drag offset
                const rect = item.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;

                dom.shortcutSettingsContainer.classList.add("dragging-ongoing");

                // Add CSS classes for styling
                setTimeout(() => {
                    item.classList.add("dragging");
                }, 0);

                e.dataTransfer.effectAllowed = "move";
            }
        });

        dom.shortcutSettingsContainer.addEventListener("dragover", e => {
            e.preventDefault();
            handleDragMove(e.clientX, e.clientY);
        });

        dom.shortcutSettingsContainer.addEventListener("dragend", e => {
            if (!isReordering || !draggedElement) return;
            cleanup();
        });

        // Global event listeners for cleanup
        document.addEventListener("dragend", () => {
            if (isReordering) {
                cleanup();
            }
        });

        // Handle window blur for cleanup
        window.addEventListener("blur", () => {
            if (isReordering || isDragging) {
                cleanup();
            }
        });
    }

    // Updates indices of all shortcut entries after reordering
    function updateShortcutIndices() {
        document.querySelectorAll(".shortcutSettingsEntry").forEach((entry, index) => {
            entry._index = index;
        });
    }

    // Saves the new shortcut order to localStorage
    function saveShortcutOrder() {
        const entries = dom.shortcutSettingsContainer.querySelectorAll(".shortcutSettingsEntry");
        const newOrder = Array.from(entries).map(entry => ({
            name: entry.querySelector(".shortcutName").value,
            url: entry.querySelector(".URL").value
        }));

        // Only save if order has changed
        if (hasOrderChanged(newOrder)) {
            localStorage.setItem("shortcutAmount", newOrder.length.toString());
            newOrder.forEach((item, index) => {
                localStorage.setItem(`shortcutName${index}`, item.name);
                localStorage.setItem(`shortcutURL${index}`, item.url);
            });

            shortcutsCache = newOrder;
            renderAllShortcuts(newOrder);
        }
    }

    // Checks if the shortcut order has changed
    function hasOrderChanged(newOrder) {
        if (newOrder.length !== shortcutsCache.length) return true;

        return newOrder.some((item, index) => {
            const cached = shortcutsCache[index];
            return item.name !== cached.name || item.url !== cached.url;
        });
    }

    // Renders all shortcuts in the main view
    function renderAllShortcuts(order) {
        const fragment = document.createDocumentFragment();

        order.forEach((item, index) => {
            const shortcut = document.createElement("div");
            shortcut.className = "shortcuts";
            shortcut._index = index;
            shortcut.innerHTML = `
            <a href="${normalizeUrl(item.url)}">
                <div class="shortcutLogoContainer">
                    ${getLogoHtml(item.url)}
                </div>
                <span class="shortcut-name">${escapeHtml(item.name)}</span>
            </a>
        `;
            fragment.appendChild(shortcut);
        });

        dom.shortcutsContainer.innerHTML = "";
        dom.shortcutsContainer.appendChild(fragment);
    }

    // Handles the shortcuts toggle checkbox change
    function handleShortcutsToggle() {
        const isChecked = this.checked;
        saveCheckboxState("shortcutsCheckboxState", this);

        dom.shortcuts.style.display = isChecked ? "flex" : "none";
        saveDisplayStatus("shortcutsDisplayStatus", isChecked ? "flex" : "none");

        dom.shortcutEditField.classList.toggle("inactive", !isChecked);
        saveActiveStatus("shortcutEditField", isChecked ? "active" : "inactive");

        dom.adaptiveIconField.classList.toggle("inactive", !isChecked);
        saveActiveStatus("adaptiveIconField", isChecked ? "active" : "inactive");
    }

    // Handles the adaptive icon toggle checkbox change
    function handleAdaptiveIconToggle() {
        saveCheckboxState("adaptiveIconToggle", this);
        if (this.checked) {
            dom.shortcutsContainer.classList.add("adaptive-icons");
        } else {
            dom.shortcutsContainer.classList.remove("adaptive-icons");
        }
    }

    // Adds a new shortcut
    function addNewShortcut() {
        const currentAmount = parseInt(localStorage.getItem("shortcutAmount")) || shortcutsCache.length;
        if (currentAmount >= MAX_SHORTCUTS) return;

        const newAmount = currentAmount + 1;
        localStorage.setItem("shortcutAmount", newAmount.toString());

        if (currentAmount >= 1) {
            document.querySelectorAll(".delete button.inactive").forEach(b => {
                b.classList.remove("inactive");
            });
        }

        if (newAmount === MAX_SHORTCUTS) {
            dom.newShortcutButton.classList.add("inactive");
        }

        const entry = createShortcutEntry(PLACEHOLDER.name, PLACEHOLDER.url, false, currentAmount);
        dom.shortcutSettingsContainer.appendChild(entry);

        saveShortcut(entry);
        renderShortcut(PLACEHOLDER.name, PLACEHOLDER.url, currentAmount);
    }

    // Deletes a shortcut
    function deleteShortcut(entry) {
        const currentAmount = parseInt(localStorage.getItem("shortcutAmount")) || shortcutsCache.length;
        if (currentAmount <= 1) return;

        const index = entry._index;
        entry.remove();
        dom.shortcutsContainer.removeChild(dom.shortcutsContainer.children[index]);

        // Update localStorage
        localStorage.setItem("shortcutAmount", (currentAmount - 1).toString());
        for (let i = index; i < currentAmount - 1; i++) {
            const nextEntry = dom.shortcutSettingsContainer.children[i];
            nextEntry._index = i;
            saveShortcut(nextEntry);
        }
        localStorage.removeItem(`shortcutName${currentAmount - 1}`);
        localStorage.removeItem(`shortcutURL${currentAmount - 1}`);

        if (currentAmount - 1 === 1) {
            document.querySelectorAll(".delete button").forEach(b => {
                b.classList.add("inactive");
            });
        }

        dom.newShortcutButton.classList.remove("inactive");
    }

    // Resets all shortcuts to default
    async function resetShortcuts() {
        if (!(await confirmPrompt(translations[currentLanguage]?.resetShortcutsPrompt || translations["en"].resetShortcutsPrompt)))
            return;

        // Animation for shortcut elements
        const shortcutEntries = [...dom.shortcutSettingsContainer.querySelectorAll('.shortcutSettingsEntry')];
        shortcutEntries.forEach(el => el.classList.add("reset-shift-animation"));

        // Animation for reset button
        const svg = dom.resetShortcutsButton.querySelector("svg");
        svg.classList.add("rotate-animation");

        // Clear storage
        for (let i = 0; i < (localStorage.getItem("shortcutAmount") || 0); i++) {
            localStorage.removeItem(`shortcutName${i}`);
            localStorage.removeItem(`shortcutURL${i}`);
        }
        localStorage.removeItem("shortcutAmount");

        // Wait for animations of shortcut elements to complete
        await new Promise(resolve => setTimeout(resolve, 300));

        // Reset UI
        dom.shortcutSettingsContainer.innerHTML = "";
        dom.shortcutsContainer.innerHTML = "";
        dom.newShortcutButton.classList.remove("inactive");
        setTimeout(() => svg.classList.remove("rotate-animation"), 500);

        // Reload
        loadShortcuts();
    }

    // Saves a single shortcut to localStorage
    function saveShortcut(entry) {
        localStorage.setItem(`shortcutName${entry._index}`, entry.querySelector(".shortcutName").value);
        localStorage.setItem(`shortcutURL${entry._index}`, entry.querySelector(".URL").value);
    }

    // 下面是你原代码里依赖但没贴出来的工具函数，我帮你补全，防止报错
    function loadCheckboxState(key, checkbox) {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            checkbox.checked = saved === "true";
        }
    }

    function saveCheckboxState(key, checkbox) {
        localStorage.setItem(key, checkbox.checked);
    }

    function loadActiveStatus(key, el) {
        const status = localStorage.getItem(key);
        if (status === "inactive") {
            el.classList.add("inactive");
        }
    }

    function saveActiveStatus(key, status) {
        localStorage.setItem(key, status);
    }

    function loadDisplayStatus(key, el) {
        const display = localStorage.getItem(key);
        if (display) {
            el.style.display = display;
        }
    }

    function saveDisplayStatus(key, display) {
        localStorage.setItem(key, display);
    }
});
