import { palabras as INITIAL_WORDS } from './data.js'

  const $tiempo = document.querySelector('time');
  const $parrafo = document.querySelector('p');
  const $entrada = document.querySelector('input');
  const $juego = document.querySelector('#juego')
  const $resultados = document.querySelector('#resultados')
  const $ppm = $resultados.querySelector('#resultados-minuto')
  const $presicion = $resultados.querySelector('#resultado-precision')
  const $boton = document.querySelector('#boton-recargar')

  const TiempoInicial = 15;

  let palabras = []
  let horaActual = TiempoInicial
  let jugando

  initGame()
  initEvents()

  // Add these at the top of the file
  const $login = document.querySelector('#login');
  const $register = document.querySelector('#register');
  const $loginForm = document.querySelector('#login-form');
  const $registerForm = document.querySelector('#register-form');
  const $showRegister = document.querySelector('#show-register');
  const $showLogin = document.querySelector('#show-login');
  
  // User storage
  // User storage initialization
  let users = JSON.parse(localStorage.getItem('monkeytype-users')) || [
  { username: 'admin', password: 'admin123', stats: [] }
  ];
  let currentUser = null;
  
  // Initialize authentication first
  initAuthEvents();
  
  // Modified initAuthEvents function
  function initAuthEvents() {
      // Show register form
      $showRegister.addEventListener('click', () => {
          $login.style.display = 'none';
          $register.style.display = 'flex';
          document.querySelector('#new-username').focus();
      });
  
      // Show login form
      $showLogin.addEventListener('click', () => {
          $register.style.display = 'none';
          $login.style.display = 'flex';
          document.querySelector('#username').focus();
      });
  
      // Login handler
      $loginForm.addEventListener('submit', handleLogin);
      
      // Register handler
      $registerForm.addEventListener('submit', handleRegister);
  }
  
  function handleLogin(e) {
      e.preventDefault();
      const username = document.querySelector('#username').value.trim();
      const password = document.querySelector('#password').value;
  
      if (!username || !password) {
          alert('Por favor ingresa usuario y contraseña');
          return;
      }
  
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          currentUser = user;
          $login.style.display = 'none';
          $juego.style.display = 'flex';
          initGame();
      } else {
          alert('Usuario o contraseña incorrectos');
      }
  }
  
  function handleRegister(e) {
      e.preventDefault();
      const username = document.querySelector('#new-username').value.trim();
      const password = document.querySelector('#new-password').value;
      const confirmPassword = document.querySelector('#confirm-password').value;
  
      if (!username || !password || !confirmPassword) {
          alert('Por favor completa todos los campos');
          return;
      }
  
      if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
      }
  
      if (users.some(u => u.username === username)) {
          alert('El usuario ya existe');
          return;
      }
  
      const newUser = { username, password, stats: [] };
      users.push(newUser);
      localStorage.setItem('monkeytype-users', JSON.stringify(users));
      
      currentUser = newUser;
      $register.style.display = 'none';
      $juego.style.display = 'flex';
      initGame();
  }
  
  // Initialize auth events first
  initAuthEvents();
  
  // Modify initGame to show game section
  function initGame() {
      $juego.style.display = 'flex';
      $resultados.style.display = 'none'
      $entrada.value = ''
  
      jugando = false
  
      palabras = INITIAL_WORDS.toSorted(
        () => Math.random() - 0.5
      ).slice(0, 50)
      horaActual = TiempoInicial
  
      $tiempo.textContent = horaActual
  
      $parrafo.innerHTML = palabras.map((word, index) => {
        const letters = word.split('')
  
        return `<word>
          ${letters
            .map(letter => `<letter>${letter}</letter>`)
            .join('')
          }
        </word>
        `
      }).join('')
  
      const $firstWord = $parrafo.querySelector('word')
      $firstWord.classList.add('active')
      $firstWord.querySelector('letter').classList.add('active')
    }
  
    
    function initEvents() {
      document.addEventListener('keydown', () => {
        $entrada.focus()
        if (!jugando) {
          jugando = true
          const intervalId = setInterval(() => {
            horaActual--
            $tiempo.textContent = horaActual
  
            if (horaActual === 0) {
              clearInterval(intervalId)
              gameOver()
            }
          }, 1000)
        }
      })
      $entrada.addEventListener('keydown', onKeyDown)
      $entrada.addEventListener('keyup', onKeyUp)
      $boton.addEventListener('click', initGame)
  
    }
  
    function onKeyDown(event) {
      const $currentWord = $parrafo.querySelector('word.active')
      const $currentLetter = $currentWord.querySelector('letter.active')
  
      const { key } = event
      if (key === ' ') {
        event.preventDefault()
  
        const $nextWord = $currentWord.nextElementSibling
        const $nextLetter = $nextWord.querySelector('letter')
  
        $currentWord.classList.remove('active', 'marked')
        $currentLetter.classList.remove('active')
  
        $nextWord.classList.add('active')
        $nextLetter.classList.add('active')
  
        $entrada.value = ''
  
        const hasMissedLetters = $currentWord
          .querySelectorAll('letter:not(.correct)').length > 0
  
        const classToAdd = hasMissedLetters ? 'marked' : 'correct'
        $currentWord.classList.add(classToAdd)
  
        return
      }
  
      if (key === 'Backspace') {
        const $prevWord = $currentWord.previousElementSibling
        const $prevLetter = $currentLetter.previousElementSibling
  
        if (!$prevWord && !$prevLetter) {
          event.preventDefault()
          return
        }
  
        const $wordMarked = $parrafo.querySelector('word.marked')
        if ($wordMarked && !$prevLetter) {
          event.preventDefault()
          $prevWord.classList.remove('marked')
          $prevWord.classList.add('active')
  
          const $letterToGo = $prevWord.querySelector('letter:last-child')
  
          $currentLetter.classList.remove('active')
          $letterToGo.classList.add('active')
  
          $entrada.value = [
            ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
          ].map($el => {
            return $el.classList.contains('correct') ? $el.innerText : '*'
          })
            .join('')
        }
      }
    }
  
    function onKeyUp() {
      
      const $currentWord = $parrafo.querySelector('word.active')
      const $currentLetter = $currentWord.querySelector('letter.active')
  
      const currentWord = $currentWord.innerText.trim()
      $entrada.maxLength = currentWord.length
  
      const $allLetters = $currentWord.querySelectorAll('letter')
  
      $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))
  
      $entrada.value.split('').forEach((char, index) => {
        const $letter = $allLetters[index]
        const letterToCheck = currentWord[index]
  
        const isCorrect = char === letterToCheck
        const letterClass = isCorrect ? 'correct' : 'incorrect'
        $letter.classList.add(letterClass)
      })
  
      $currentLetter.classList.remove('active', 'is-last')
      const inputLength = $entrada.value.length
      const $nextActiveLetter = $allLetters[inputLength]
  
      if ($nextActiveLetter) {
        $nextActiveLetter.classList.add('active')
      } else {
        $currentLetter.classList.add('active', 'is-last')
        
      }
    }
  
    function gameOver() {
      $juego.style.display = 'none'
      $resultados.style.display = 'flex'
  
      const correctWords = $parrafo.querySelectorAll('word.correct').length
      const correctLetter = $parrafo.querySelectorAll('letter.correct').length
      const incorrectLetter = $parrafo.querySelectorAll('letter.incorrect').length
  
      const totalLetters = correctLetter + incorrectLetter
  
      const accuracy = totalLetters > 0
        ? (correctLetter / totalLetters) * 100
        : 0
  
      const wpm = correctWords * 60 / TiempoInicial
      $ppm.textContent = wpm
      $presicion.textContent = `${accuracy.toFixed(2)}%`
    }

    // Add initAuthEvents to the initialization
    function initEvents() {
        initAuthEvents();
        document.addEventListener('keydown', () => {
          $entrada.focus()
          if (!jugando) {
            jugando = true
            const intervalId = setInterval(() => {
              horaActual--
              $tiempo.textContent = horaActual
  
              if (horaActual === 0) {
                clearInterval(intervalId)
                gameOver()
              }
            }, 1000)
          }
        })
        $entrada.addEventListener('keydown', onKeyDown)
        $entrada.addEventListener('keyup', onKeyUp)
        $boton.addEventListener('click', initGame)
  
      }