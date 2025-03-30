document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const gift = document.querySelector(".gift");
  const eidMessage = document.getElementById("eid-message");
  const confettiCanvas = document.getElementById("confetti");

  // Audio elements
  const bgAudio = document.getElementById("bgAudio");
  const boxClickAudio = document.getElementById("boxClickAudio");
  const collectAudio = document.getElementById("collectAudio");
  const messageAudio = document.getElementById("messageAudio");
  const countAudio = document.getElementById("countAudio");
  const resetAudio = document.getElementById("resetAudio");

  // Play background audio
  bgAudio.play();

  // Create money canvas
  const moneyCanvas = document.createElement("canvas");
  moneyCanvas.id = "money-canvas";
  document.body.appendChild(moneyCanvas);

  // Create gift message container
  const giftMessageContainer = document.createElement("div");
  giftMessageContainer.className = "gift-message-container";
  giftMessageContainer.style.display = "none";
  document.body.appendChild(giftMessageContainer);

  // Canvas contexts
  const confettiCtx = confettiCanvas.getContext("2d");
  const moneyCtx = moneyCanvas.getContext("2d");

  // Set canvas sizes
  function resizeCanvases() {
    confettiCanvas.width = moneyCanvas.width = window.innerWidth;
    confettiCanvas.height = moneyCanvas.height = window.innerHeight;
  }
  resizeCanvases();

  // State variables
  let isOpened = false;
  let moneyParticles = [];
  let spreadParticles = [];
  let moneyAnimationRunning = false;
  const loadedMoneyImages = {};
  let totalAmount = 0;

  // Riyal denominations with properties
  const denominations = [
    {
      value: 5,
      image: "img/5riyal.png",
      color: "#552D6E",
      gift: "5 Riyals",
      message: "Not much, but keep going! You're getting closer.",
    },
    {
      value: 10,
      image: "img/10riyal.png",
      color: "#A97C50",
      gift: "10 Riyals",
      message: "Good start! A little more and you'll have enough for a snack.",
    },
    {
      value: 50,
      image: "img/50riyal.png",
      color: "#3A7D44",
      gift: "50 Riyals",
      message: "Nice! You're definitely making progress.",
    },
    {
      value: 100,
      image: "img/100riyal.png",
      color: "#BE1E2D",
      gift: "100 Riyals",
      message: "Great job! You're on a winning streak.",
    },
    {
      value: 200,
      image: "img/200riyal.png",
      color: "#A8A29E",
      gift: "200 Riyals",
      message: "Impressive! You're really racking up the rewards.",
    },
    {
      value: 500,
      image: "img/500riyal.png",
      color: "#005F9E",
      gift: "500 Riyals",
      message: "Big win! Time to celebrate, but don't go overboard!",
    },
  ];

  // Preload money images
  function preloadMoneyImages() {
    denominations.forEach((denom) => {
      const img = new Image();
      img.src = denom.image;
      img.onload = () => {
        loadedMoneyImages[denom.value] = img;
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${denom.image}`);
        // Create a colored placeholder if image fails to load
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = denom.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `${denom.value} Riyal`,
          canvas.width / 2,
          canvas.height / 2
        );
        loadedMoneyImages[denom.value] = canvas;
      };
    });
  }
  preloadMoneyImages();

  // Hide instruction after 5 seconds
  setTimeout(() => {
    instruction.style.opacity = "0";
    setTimeout(() => {
      instruction.style.display = "none";
    }, 1000);
  }, 5000);

  // Gift click handler
  gift.addEventListener("click", function () {
    if (isOpened) return;
    isOpened = true;

    // Stop bounce animation and shake the gift
    gift.style.animation = "shake 0.5s";
    boxClickAudio.play(); // Play the click on the box audio

    setTimeout(() => {
      gift.classList.add("open");
      setTimeout(() => {
        // Reset total amount when opening new gift
        totalAmount = 0;
        updateTotalAmount();
        eidMessage.style.opacity = "1";
        fireConfetti();
        // Create both types of money particles
        createBoxMoney(); // Stays in/near box
        createSpreadMoney(); // Spreads across screen
        messageAudio.play(); // Play the message audio

        setTimeout(() => {
          eidMessage.style.opacity = "0";
          setTimeout(() => {
            gift.classList.remove("open");
            setTimeout(() => {
              gift.style.animation = "bounce 2s infinite";
              isOpened = false;
            }, 300);
          }, 500);
        }, 5000);
      }, 500);
    }, 500);
  });

  // Confetti effect
  function fireConfetti() {
    // First burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E6A4B9", "#FFD700", "#00A2FF", "#98FB98"],
      shapes: ["circle", "square"],
      scalar: 1.2,
    });
    // Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#E6A4B9", "#FFD700", "#c88dc1"],
        shapes: ["circle"],
        scalar: 1.3,
      });
    }, 250);
    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#E6A4B9", "#FFD700", "#c88dc1"],
        shapes: ["circle"],
        scalar: 1.3,
      });
    }, 400);
  }

  // Create money that stays in/near the box
  function createBoxMoney() {
    const giftRect = gift.getBoundingClientRect();
    const originX = giftRect.left + giftRect.width / 2;
    const originY = giftRect.top + giftRect.height / 2;
    for (let i = 0; i < 12; i++) {
      const denom =
        denominations[Math.floor(Math.random() * denominations.length)];
      moneyParticles.push({
        x: originX,
        y: originY,
        size: 90 + Math.random() * 40,
        value: denom.value,
        image: denom.image,
        color: denom.color,
        giftTitle: denom.gift,
        giftMessage: denom.message,
        speedX: (Math.random() - 0.5) * 3, // Slow horizontal movement
        speedY: -2 - Math.random() * 3, // Gentle upward motion
        gravity: 0.05, // Light gravity
        rotation: Math.random() * Math.PI * 2,
        rollAmount: 0.4 + Math.random() * 0.3, // Moderate curl
        life: 1000 + Math.random() * 500, // Long lifespan
        decay: 0.15 + Math.random() * 0.15, // Slow decay
        type: "box",
        state: "curled", // "curled", "unrolling", "flat"
        unrollProgress: 0,
        clickTime: 0,
      });
    }
    if (!moneyAnimationRunning) {
      moneyAnimationRunning = true;
      requestAnimationFrame(animateMoney);
    }
  }

  // Create money that spreads across the screen
  function createSpreadMoney() {
    const giftRect = gift.getBoundingClientRect();
    const originX = giftRect.left + giftRect.width / 2;
    const originY = giftRect.top + giftRect.height / 2;
    for (let i = 0; i < 18; i++) {
      const denom =
        denominations[Math.floor(Math.random() * denominations.length)];
      spreadParticles.push({
        x: originX,
        y: originY,
        size: 60 + Math.random() * 40,
        value: denom.value,
        image: denom.image,
        color: denom.color,
        giftTitle: denom.gift,
        giftMessage: denom.message,
        speedX: (Math.random() - 0.5) * 15, // Fast horizontal spread
        speedY: -8 - Math.random() * 10, // Strong upward force
        gravity: 0.2, // Normal gravity
        rotation: Math.random() * Math.PI * 2,
        rollAmount: 0.3 + Math.random() * 0.4, // Lighter curl
        life: 600 + Math.random() * 400, // Medium lifespan
        decay: 0.25 + Math.random() * 0.25, // Normal decay
        type: "spread",
        state: "curled",
        unrollProgress: 0,
        clickTime: 0,
      });
    }
  }

  // Handle money click
  function handleMoneyClick(e) {
    const rect = moneyCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    // Check both particle arrays
    const allParticles = [...moneyParticles, ...spreadParticles];
    for (let i = allParticles.length - 1; i >= 0; i--) {
      const p = allParticles[i];
      if (p.state !== "curled") continue;
      if (now - p.clickTime < 300) continue;
      const img = loadedMoneyImages[p.value];
      const width = p.size;
      const height = width / (img ? img.width / img.height : 0.5);
      const radius = Math.max(width, height) / 2;
      const dx = x - p.x;
      const dy = y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius * 0.8) {
        showGiftMessage(p);
        p.state = "unrolling";
        p.clickTime = now;
        // Increment the total amount by the value of the clicked particle
        totalAmount += p.value;
        updateTotalAmount();
        collectAudio.play(); // Play the collect audio
        // Different physics based on type
        if (p.type === "box") {
          p.speedX = (Math.random() - 0.5) * 8;
          p.speedY = -4 - Math.random() * 5;
        } else {
          p.speedX = (Math.random() - 0.5) * 20;
          p.speedY = -12 - Math.random() * 8;
        }
        return;
      }
    }
  }

  // Show gift message with smooth animation
  function showGiftMessage(particle) {
    giftMessageContainer.innerHTML = `
      <div class="gift-message">
        <div class="gift-message-inner">
          <button class="close-message-btn">×</button>
          ${
            loadedMoneyImages[particle.value]
              ? `<img src="${particle.image}" alt="${particle.value} Riyal" class="gift-message-image">`
              : `<div class="money-placeholder" style="background-color:${particle.color}">${particle.value}</div>`
          }
          <div class="gift-message-content">
            <h3>${particle.giftTitle}</h3>
            <p>${particle.giftMessage}</p>
          </div>
        </div>
      </div>
    `;
    const giftMessage = giftMessageContainer.querySelector(".gift-message");
    giftMessage.style.left = `${particle.x}px`;
    giftMessage.style.top = `${particle.y}px`;
    giftMessageContainer.style.display = "block";
    // Animate appearance
    giftMessage.style.opacity = "0";
    giftMessage.style.transform = "translate(-50%, -50%) scale(0.5)";
    setTimeout(() => {
      giftMessage.style.transition =
        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      giftMessage.style.opacity = "1";
      giftMessage.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);
    // Add click handler for the close button
    const closeBtn = giftMessageContainer.querySelector(".close-message-btn");
    closeBtn.addEventListener("click", hideGiftMessage);
    // Also close if clicking anywhere outside the message
    giftMessageContainer.addEventListener("click", function (e) {
      if (!giftMessage.contains(e.target)) {
        hideGiftMessage();
      }
    });
    // Auto-hide after timeout (but can be closed manually)
    giftMessageContainer.autoHideTimeout = setTimeout(hideGiftMessage, 2500);
  }

  // New function to hide the gift message
  function hideGiftMessage() {
    const giftMessage = giftMessageContainer.querySelector(".gift-message");
    if (!giftMessage) return;
    // Clear the auto-hide timeout if it exists
    if (giftMessageContainer.autoHideTimeout) {
      clearTimeout(giftMessageContainer.autoHideTimeout);
    }
    // Animate disappearance
    giftMessage.style.transition = "all 0.4s ease-in";
    giftMessage.style.opacity = "0";
    giftMessage.style.transform = "translate(-50%, -50%) scale(0.8)";
    setTimeout(() => {
      giftMessageContainer.style.display = "none";
    }, 400);
  }

  // Draw money with appropriate style
  function drawMoney(ctx, p) {
    const img = loadedMoneyImages[p.value];
    const width = p.size;
    const height = width / (img ? img.width / img.height : 0.5);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.imageSmoothingEnabled = true;
    if (p.state === "curled") {
      // Draw curled money - different style based on type
      if (p.type === "box") {
        drawTightCurl(ctx, img, width, height, p.rollAmount, p.color, p.value);
      } else {
        drawLooseCurl(ctx, img, width, height, p.rollAmount, p.color, p.value);
      }
    } else if (p.state === "unrolling") {
      // Animate unrolling
      p.unrollProgress = Math.min(1, p.unrollProgress + 0.04);
      // Draw unrolled part
      const unrolledWidth = width * p.unrollProgress;
      if (img) {
        ctx.drawImage(
          img,
          0,
          0,
          img.width * p.unrollProgress,
          img.height,
          -width / 2,
          -height / 2,
          unrolledWidth,
          height
        );
      } else {
        // Fallback for missing images
        ctx.fillStyle = p.color;
        ctx.fillRect(-width / 2, -height / 2, unrolledWidth, height);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${width / 8}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(p.value, -width / 2 + unrolledWidth / 2, height / 4);
      }
      // Draw still curled part
      if (p.unrollProgress < 1) {
        const curlWidth = width * (1 - p.unrollProgress);
        const curlHeight = height * p.rollAmount * (1 - p.unrollProgress);
        ctx.save();
        ctx.translate(-width / 2 + unrolledWidth, 0);
        if (p.type === "box") {
          drawTightCurl(
            ctx,
            img,
            curlWidth,
            curlHeight,
            p.rollAmount,
            p.color,
            p.value
          );
        } else {
          drawLooseCurl(
            ctx,
            img,
            curlWidth,
            curlHeight,
            p.rollAmount,
            p.color,
            p.value
          );
        }
        ctx.restore();
      } else {
        p.state = "flat";
      }
    } else {
      // Draw flat money
      if (img) {
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
      } else {
        // Fallback for missing images
        ctx.fillStyle = p.color;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${width / 5}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(p.value, 0, height / 4);
      }
    }
    ctx.restore();
  }

  // Draw a tight curl (for box money)
  function drawTightCurl(ctx, img, width, height, rollAmount, color, value) {
    const segments = 12;
    const segmentWidth = width / segments;
    const maxCurve = height * rollAmount;
    for (let i = 0; i < segments; i++) {
      const x = -width / 2 + i * segmentWidth;
      const progress = i / (segments - 1);
      const curve = Math.sin(progress * Math.PI) * maxCurve;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, -height / 2 + curve);
      ctx.lineTo(x + segmentWidth, -height / 2 + curve);
      ctx.lineTo(x + segmentWidth, height / 2 - curve);
      ctx.lineTo(x, height / 2 - curve);
      ctx.closePath();
      ctx.clip();
      if (img) {
        const sx = (i / segments) * img.width;
        ctx.drawImage(
          img,
          sx,
          0,
          segmentWidth,
          img.height,
          x,
          -height / 2,
          segmentWidth,
          height
        );
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, -height / 2, segmentWidth, height);
        if (i === Math.floor(segments / 2)) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${width / 10}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(value, x + segmentWidth / 2, height / 4);
        }
      }
      ctx.restore();
    }
    // Add paper edge highlight
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.quadraticCurveTo(0, -height / 2 - maxCurve, width / 2, -height / 2);
    ctx.stroke();
  }

  // Draw a loose curl (for spread money)
  function drawLooseCurl(ctx, img, width, height, rollAmount, color, value) {
    const segments = 8;
    const segmentWidth = width / segments;
    const maxCurve = height * rollAmount * 0.7;
    for (let i = 0; i < segments; i++) {
      const x = -width / 2 + i * segmentWidth;
      const progress = i / (segments - 1);
      const curve = Math.sin(progress * Math.PI) * maxCurve;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, -height / 2 + curve);
      ctx.lineTo(x + segmentWidth, -height / 2 + curve);
      ctx.lineTo(x + segmentWidth, height / 2 - curve);
      ctx.lineTo(x, height / 2 - curve);
      ctx.closePath();
      ctx.clip();
      if (img) {
        const sx = (i / segments) * img.width;
        ctx.drawImage(
          img,
          sx,
          0,
          segmentWidth,
          img.height,
          x,
          -height / 2,
          segmentWidth,
          height
        );
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, -height / 2, segmentWidth, height);
        if (i === Math.floor(segments / 2)) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${width / 10}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(value, x + segmentWidth / 2, height / 4);
        }
      }
      ctx.restore();
    }
  }

  // Animation loop with transparent background
  function animateMoney() {
    // Clear canvas completely (transparent background)
    moneyCtx.clearRect(0, 0, moneyCanvas.width, moneyCanvas.height);
    // Animate box money
    for (let i = moneyParticles.length - 1; i >= 0; i--) {
      const p = moneyParticles[i];
      // Update physics
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.state !== "curled") {
        p.speedY += p.gravity;
        p.speedX *= 0.98;
        p.rotation += p.speedX * 0.01;
      }
      p.life -= p.decay;
      // Draw if still alive
      if (p.life > 0 && p.y < moneyCanvas.height + p.size) {
        drawMoney(moneyCtx, p);
      } else {
        moneyParticles.splice(i, 1);
      }
    }
    // Animate spread money
    for (let i = spreadParticles.length - 1; i >= 0; i--) {
      const p = spreadParticles[i];
      // Update physics
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.state !== "curled") {
        p.speedY += p.gravity;
        p.speedX *= 0.98;
        p.rotation += p.speedX * 0.01;
      }
      p.life -= p.decay;
      // Draw if still alive
      if (p.life > 0 && p.y < moneyCanvas.height + p.size) {
        drawMoney(moneyCtx, p);
      } else {
        spreadParticles.splice(i, 1);
      }
    }
    // Continue animation if particles remain
    if (moneyParticles.length > 0 || spreadParticles.length > 0) {
      requestAnimationFrame(animateMoney);
    } else {
      moneyAnimationRunning = false;
    }
  }

  // Function to update the total amount display
  function updateTotalAmount() {
    document.getElementById("total-amount").querySelector("span").textContent =
      totalAmount;
    if (totalAmount === 0) {
      resetAudio.play(); // Play the reset audio when total becomes 0
    }
  }

  // Create and position total amount display
  const totalAmountElement = document.createElement("div");
  totalAmountElement.id = "total-amount";
  totalAmountElement.className = "total-amount";
  totalAmountElement.innerHTML = `
    <div style="display: flex; justify-content: flex-start; align-items: center;">
      Total: 
      <img src="img/icon.png" alt="$" style="width: 24px; height: 24px; vertical-align: middle; margin-left: 8px;">
      <span style="margin-left: 10px;">0</span>
    </div>
  `;
  document.body.appendChild(totalAmountElement);

  // Style the total amount display
  totalAmountElement.style.position = "absolute";
  totalAmountElement.style.top = "30px";
  totalAmountElement.style.right = "25px";
  totalAmountElement.style.fontSize = "24px";
  totalAmountElement.style.color = "black";
  totalAmountElement.style.zIndex = "1000";
  totalAmountElement.style.fontFamily = "Silkscreen, sans-serif";
  totalAmountElement.style.display = "flex";
  totalAmountElement.style.alignItems = "center";
  totalAmountElement.style.gap = "19px";

  // Event listeners
  moneyCanvas.style.pointerEvents = "auto";
  moneyCanvas.addEventListener("click", handleMoneyClick);
  moneyCanvas.addEventListener("touchstart", handleMoneyClick, {
    passive: true,
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    resizeCanvases();
    if (moneyAnimationRunning) {
      moneyCtx.clearRect(0, 0, moneyCanvas.width, moneyCanvas.height);
    }
  });

  // Initialize
  resizeCanvases();
  updateTotalAmount();
});
