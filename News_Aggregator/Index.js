// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAev4mYzajuvdlQs3vB96kTPiwzn9_y3VM",
  authDomain: "climatebynews.firebaseapp.com",
  projectId: "climatebynews",
  storageBucket: "climatebynews.firebasestorage.app",
  messagingSenderId: "607211890968",
  appId: "1:607211890968:web:8c0b3e42c90ee18618566d",
  measurementId: "G-W2ZQV630KR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const loginModalBtn = document.getElementById('loginModalBtn');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const userDisplay = document.getElementById('userDisplay');
const userName = document.getElementById('userName');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('authError');

const sourceSelect = document.getElementById('sourceSelect');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const applyFiltersBtn = document.getElementById('applyFilters');

const generalBtn = document.getElementById('general');
const businessBtn = document.getElementById('business');
const sportsBtn = document.getElementById('sports');
const technologyBtn = document.getElementById('technology');
const climateBtn = document.getElementById('climate');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

const newsQuery = document.getElementById('newsQuery');
const newsType = document.getElementById('newsType');
const newsdetails = document.getElementById('newsdetails');
const heroSection = document.getElementById('heroSection');
const dynamicHeadline = document.getElementById('dynamicHeadline');
const dynamicDescription = document.getElementById('dynamicDescription');
const readMoreLink = document.getElementById('readMoreLink');

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// API Configuration
const API_KEY = "ebadabbd0a3c46ecbc05c6e705f02688";
const BASE_URL = "https://newsapi.org/v2";
const DEFAULT_PARAMS = `apiKey=${API_KEY}`;
const HEADLINES_NEWS =`${BASE_URL}/everything?q=climate+change&domains=theguardian.com,bbc.co.uk,nytimes.com&language=en&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const GENERAL_NEWS = `${BASE_URL}/everything?q=general&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const BUSINESS_NEWS = `${BASE_URL}/everything?q=business&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const SPORTS_NEWS = `${BASE_URL}/everything?q=sports&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const TECHNOLOGY_NEWS = `${BASE_URL}/everything?q=technology&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const CLIMATE_NEWS = `${BASE_URL}/everything?q=climate+change+global+warming+environment&language=en&sortBy=publishedAt&${DEFAULT_PARAMS}`;
const SEARCH_NEWS = `${BASE_URL}/everything?sortBy=publishedAt&${DEFAULT_PARAMS}&q=`;

// State Variables
let newsDataArr = [];
let currentPage = 1;
let currentUrl = HEADLINES_NEWS;
let articleModalInstance = null;

// === Auth Functions ===
loginModalBtn.addEventListener('click', () => {
  loginModal.show();
});

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginModal.hide();
      resetAuthForm();
    })
    .catch(error => {
      showAuthError(error.message);
    });
});

signupBtn.addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password should be at least 6 characters');
    return;
  }
  
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      loginModal.hide();
      resetAuthForm();
    })
    .catch(error => {
      showAuthError(error.message);
    });
});

logoutBtn.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      console.log('User signed out');
    })
    .catch(error => {
      console.error('Error signing out:', error);
    });
});

function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('d-none');
}

function resetAuthForm() {
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  authError.classList.add('d-none');
}

auth.onAuthStateChanged(user => {
  if (user) {
    loginModalBtn.classList.add('d-none');
    userDisplay.classList.remove('d-none');
    userName.textContent = user.email.split('@')[0];
  } else {
    loginModalBtn.classList.remove('d-none');
    userDisplay.classList.add('d-none');
  }
});

// === Theme Functions ===
themeToggle.addEventListener('change', () => {
  const isDark = themeToggle.checked;
  setTheme(isDark ? 'dark' : 'light');
});

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';

  // Dynamically update modal styling
  const modal = document.getElementById('articleModal');
  const modalContent = modal?.querySelector('.modal-content');

  if (modalContent) {
    if (theme === 'dark') {
      modalContent.classList.add('bg-dark', 'text-white');
      modalContent.classList.remove('bg-white', 'text-dark');
    } else {
      modalContent.classList.add('bg-white', 'text-dark');
      modalContent.classList.remove('bg-dark', 'text-white');
    }
  }
}


function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  themeToggle.checked = savedTheme === 'dark';
  setTheme(savedTheme);
}


// === News Fetching Functions ===
function showLoading() {
  loadingSpinner.style.display = 'flex';
}

function hideLoading() {
  loadingSpinner.style.display = 'none';
}

// Fetch Hero News for the Featured Section
async function fetchHeroNews() {
  try {
    showLoading();
    const response = await fetch(CLIMATE_NEWS);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      // Find an article with an image
      const featuredArticle = data.articles.find(article => article.urlToImage) || data.articles[0];
      
      // Update hero section background with the image
      if (featuredArticle.urlToImage) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(76, 175, 80, 0.7), rgba(76, 175, 80, 0.5)), url('${featuredArticle.urlToImage}')`;
      }
      
      // Update headline and description
      dynamicHeadline.textContent = featuredArticle.title;
      dynamicDescription.textContent = featuredArticle.description || '';
      readMoreLink.href = featuredArticle.url;
      
      // Setup rotating headlines
      const headlines = data.articles.slice(0, 5);
      let currentIndex = 0;
      
      setInterval(() => {
        currentIndex = (currentIndex + 1) % headlines.length;
        const article = headlines[currentIndex];
        
        // Fade out
        dynamicHeadline.style.opacity = 0;
        dynamicDescription.style.opacity = 0;
        
        // Update content after fade out
        setTimeout(() => {
          dynamicHeadline.textContent = article.title;
          dynamicDescription.textContent = article.description || '';
          readMoreLink.href = article.url;
          
          // Fade in
          dynamicHeadline.style.opacity = 1;
          dynamicDescription.style.opacity = 1;
        }, 500);
      }, 8000);
    } else {
      dynamicHeadline.textContent = 'No climate news available';
      dynamicDescription.textContent = 'Please check back later for updates';
    }
  } catch (error) {
    console.error('Error fetching hero news:', error);
    dynamicHeadline.textContent = 'Error loading news';
    dynamicDescription.textContent = 'Please try again later';
  } finally {
    hideLoading();
  }
}

// Event Listeners for Navigation
generalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newsType.innerHTML = "<h4>General News</h4>";
  fetchCategoryNews(GENERAL_NEWS);
});

businessBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newsType.innerHTML = "<h4>Business News</h4>";
  fetchCategoryNews(BUSINESS_NEWS);
});

sportsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newsType.innerHTML = "<h4>Sports News</h4>";
  fetchCategoryNews(SPORTS_NEWS);
});

technologyBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newsType.innerHTML = "<h4>Technology News</h4>";
  fetchCategoryNews(TECHNOLOGY_NEWS);
});

climateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newsType.innerHTML = "<h4>Climate News</h4>";
  fetchCategoryNews(CLIMATE_NEWS);
});

searchBtn.addEventListener('click', () => {
  const query = newsQuery.value.trim();
  if (!query) return;
  
  newsType.innerHTML = `<h4>Search Results: ${query}</h4>`;
  fetchCategoryNews(`${SEARCH_NEWS}${encodeURIComponent(query)}`);
});

// Apply filters
applyFiltersBtn.addEventListener('click', () => {
  const source = sourceSelect.value;
  const from = fromDate.value;
  const to = toDate.value;
  
  let url = currentUrl;
  
  if (source) {
    url += `&sources=${source}`;
  }
  
  if (from) {
    url += `&from=${from}`;
  }
  
  if (to) {
    url += `&to=${to}`;
  }
  
  fetchCategoryNews(url);
});

// Load more news
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchMoreNews();
});

async function fetchCategoryNews(url) {
  currentUrl = url;
  currentPage = 1;
  fetchNews(url);
}

async function fetchMoreNews() {
  const pageParam = currentUrl.includes('?') ? '&' : '?';
  const url = `${currentUrl}${pageParam}page=${currentPage}`;
  
  try {
    showLoading();
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      newsDataArr = [...newsDataArr, ...data.articles];
      displayNews(false);
      
      // Show/hide load more button
      loadMoreBtn.classList.toggle('d-none', data.articles.length < 10);
    } else {
      loadMoreBtn.classList.add('d-none');
    }
  } catch (error) {
    console.error('Error fetching more news:', error);
  } finally {
    hideLoading();
  }
}

async function fetchNews(url) {
  try {
    showLoading();
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      newsDataArr = data.articles;
      displayNews(true);
      
      // Show load more button if we have a decent number of articles
      loadMoreBtn.classList.toggle('d-none', data.articles.length < 10);
    } else {
      newsdetails.innerHTML = '<div class="col-12"><div class="alert alert-info">No news found. Try different filters or search terms.</div></div>';
      loadMoreBtn.classList.add('d-none');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    newsdetails.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading news. Please try again later.</div></div>';
  } finally {
    hideLoading();
  }
}

function displayNews() {
  newsdetails.innerHTML = "";

  if (newsDataArr.length === 0) {
    newsdetails.innerHTML = "<h5>No data found.</h5>";
    return;
  }

  newsDataArr.forEach(news => {
    const date = news.publishedAt.split("T")[0];
    const authorText = news.author || news.source?.name || "Unknown";

    const col = document.createElement('div');
    col.className = "col-sm-12 col-md-4 col-lg-3 p-2";

    const card = document.createElement('div');
    card.className = "card d-flex flex-column h-100 shadow-sm";

    const image = document.createElement('img');
    image.className = "card-img-top";
    image.src = news.urlToImage || "images/fallback.jpg";
    image.alt = "Article Image";

    const cardBody = document.createElement('div');
    cardBody.className = "card-body d-flex flex-column justify-content-between";

    const title = document.createElement('h5');
    title.className = "card-title mb-2";
    title.innerText = news.title;

    const dateEl = document.createElement('h6');
    dateEl.className = "text-primary mb-1";
    dateEl.innerText = date;

    const author = document.createElement('p');
    author.className = "text-muted mb-2 small fst-italic";
    author.innerText = `By ${authorText}`;

    const desc = document.createElement('p');
    desc.className = "card-text mb-3";
    desc.innerText = news.description || "No description available.";

    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = "btn btn-success mt-auto";
    readMoreBtn.innerText = "Read more";
    readMoreBtn.setAttribute("data-bs-toggle", "modal");
    readMoreBtn.setAttribute("data-bs-target", "#articleModal");

    readMoreBtn.addEventListener("click", () => {
      const date = (news.publishedAt || "").split("T")[0];
      const authorText = news.author || news.source?.name || "Unknown";
      const category = news.source?.name || "News";
    
      document.getElementById("modalTitle").innerText = news.title;
      document.getElementById("modalImg").src = news.urlToImage || "images/fallback.jpg";
      document.getElementById("modalAuthor").innerText = `By ${authorText}`;
      document.getElementById("modalDate").innerText = `Published: ${date}`;
      document.getElementById("modalCategory").innerText = category;
      document.getElementById("modalDesc").innerText = news.content || news.description || "No further content available.";
      document.getElementById("modalLink").href = news.url;
    
      // 🔗 Share buttons
      document.getElementById("shareTwitter").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(news.url)}`;
      document.getElementById("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(news.url)}`;
    });
    

    // Build card
    cardBody.appendChild(title);
    cardBody.appendChild(dateEl);
    cardBody.appendChild(author);
    cardBody.appendChild(desc);
    cardBody.appendChild(readMoreBtn);

    card.appendChild(image);
    card.appendChild(cardBody);
    col.appendChild(card);

    newsdetails.appendChild(col);
  });
}


// Initialize the Page
window.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();
  newsType.innerHTML = "<h4>Climate News</h4>";
  fetchNews(CLIMATE_NEWS);
  fetchHeroNews();
  console.log("Website initialized with climate focus");
  
  
});
