const cardContainer = document.getElementById('card-container');
const likeBtn = document.querySelector('.btn.like');
const dislikeBtn = document.querySelector('.btn.dislike');
const restartBtn = document.getElementById('restart-btn');
const swipeHint = document.getElementById('hint');
const likedList = document.getElementById('liked-list');

let catImages = [];
let likedCats = [];
let dislikedCats = [];
let totalLiked = 0;

cardContainer.style.display = 'none';
document.getElementById('card-buttons').style.display = 'none';
document.getElementById('summary').style.display = 'none';

function getCurrentCard() {
  return cardContainer.querySelector('[data-index="0"]');
}

function removeCard(card, liked = false) {
  if (!card) return;
  
  if (liked) { likedCats.push(card.src); totalLiked++; }
  else { dislikedCats.push(card.src); }

  card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  card.style.opacity = 0;
  card.addEventListener('transitionend', () => {
    card.remove();
    const cards = Array.from(cardContainer.children);
    cards.forEach((c, i) => {
      c.setAttribute('data-index', i);
      c.style.zIndex = cards.length - i;
    });
    checkEnd();
  }, { once: true });
}

function checkEnd() {
  if (!cardContainer.querySelector('[data-index="0"]')) {
    cardContainer.style.display = 'none';
    document.getElementById('card-buttons').style.display = 'none';
    document.getElementById('summary').style.display = 'flex';
    document.getElementById('total-liked').textContent = totalLiked;
    document.getElementById('total-liked').style.color = '#22c55e';

    likedList.innerHTML = '';
    likedCats.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.style.objectFit = 'cover';
      img.style.borderRadius = '12px';
      likedList.appendChild(img);
    });
  }
}

// like/dislike button
likeBtn.addEventListener('click', () => {
  const card = getCurrentCard();
  if (!card) return;
  card.style.transform = 'translateX(500px) rotate(20deg)';
  removeCard(card, true);
});

dislikeBtn.addEventListener('click', () => {
  const card = getCurrentCard();
  if (!card) return;
  card.style.transform = 'translateX(-500px) rotate(-20deg)';
  removeCard(card, false);
});

// restart
restartBtn.addEventListener('click', () => {
  likedList.innerHTML = '';
  totalLiked = 0;
  document.getElementById('total-liked').textContent = 0;
  document.getElementById('summary').style.display = 'none';
  cardContainer.innerHTML = '';
  catImages = [];
  likedCats = [];
  dislikedCats = [];
  loadCatImages();
});

async function getCats(count = 10) {
  const requests = Array.from({ length: count }, () => 
    fetch('https://cataas.com/cat?json=true').then(r => r.json()).catch(() => ({ url: '' }))
  );
  const results = await Promise.all(requests);
  return results.map(d => d.url).filter(url => url);
}

function setupHammerSwipe(img, index, total) {
  const hammer = new Hammer(img);
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

  let posX = 0, posY = 0, rotation = 0;

  hammer.on('pan', (e) => {
    posX = e.deltaX;
    posY = e.deltaY;
    rotation = posX / 10;
    img.style.transform = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
  });

  hammer.on('panend', () => {
    const threshold = 150;
    if (posX > threshold) {
      img.style.transform = `translate(1000px, ${posY}px) rotate(${rotation}deg)`;
      removeCard(img, true);
    } else if (posX < -threshold) {
      img.style.transform = `translate(-1000px, ${posY}px) rotate(${rotation}deg)`;
      removeCard(img, false);
    } else {
      img.style.transform = 'translate(0px, 0px) rotate(0deg)';
    }
  });
}

async function loadCatImages() {
  catImages = await getCats(10);

  cardContainer.style.display = 'block';
  document.getElementById('card-buttons').style.display = 'flex';
  swipeHint.style.display = 'flex';
  swipeHint.classList.add('flash');

  const total = catImages.length;
  
  catImages.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Cute cat';
    img.setAttribute('data-index', index);
    img.style.cursor = 'grab';
    img.style.opacity = 0; 
    img.style.borderRadius = '10px';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.zIndex = total - index; 
    
    cardContainer.appendChild(img);

    img.onload = () => {
      img.style.opacity = 1; 
    };

    setupHammerSwipe(img, index, total);
  });
}

function hideHint() { swipeHint.style.display = 'none'; }
swipeHint.addEventListener('click', hideHint);
document.addEventListener('touchstart', hideHint, { once: true });
document.addEventListener('mousedown', hideHint, { once: true });

document.addEventListener('DOMContentLoaded', () => { loadCatImages(); });